// async global event queue. Systems directly read from this and handle their relevant messages

const MAX_EVENT_COUNT = 200

const bufA = new Array(MAX_EVENT_COUNT)
const bufB = new Array(MAX_EVENT_COUNT)
const bufC = new Array(MAX_EVENT_COUNT)

for (let i=0; i < MAX_EVENT_COUNT; i++) {
	bufA[i] = { type: undefined, entity: undefined, args: undefined }
	bufB[i] = { type: undefined, entity: undefined, args: undefined }
	bufC[i] = { type: undefined, entity: undefined, args: undefined, tickTTL: -1 }
}

const _scheduled = {
	buf: bufC,
	//length: 0
}

const _staged = {
	buf: bufA,
	length: 0
}   // events are first added here, to be processed on the next frame

const buffer = {
	buf: bufB,
	length: 0
}    // events to process this frame


function add (type, entity, ...args) {
	if (_staged.length >= MAX_EVENT_COUNT)
		throw new Error(`failed to create new Event because the buffer is already full.`)

	_staged.buf[_staged.length].type = type
	_staged.buf[_staged.length].entity = entity
	_staged.buf[_staged.length].args = args

	_staged.length++
}


// create an event after tickCount frames have elapsed
//
// @param Integer tickCount how many ticks must elapse before this event is available
function schedule (tickCount, type, entity, ...args) {

	if (tickCount < 0)
		throw new Error(`Can't schedule events in negative ticks`)
		

	// find an empty slot in the scheduled array to insert
	let idx = -1
	for (let i=0; i < MAX_EVENT_COUNT; i++) {
		if (_scheduled.buf[i].tickTTL < 0) {
			idx = i
			break
		}
	}

	if (idx >= 0) {
		_scheduled.buf[idx].type = type
		_scheduled.buf[idx].entity = entity
		_scheduled.buf[idx].args = args
		_scheduled.buf[idx].tickTTL = tickCount
		//_scheduled.length++
	} else {
		throw new Error(`failed to schedule new Event because the buffer is already full.`)
	}
}


// called at the end of every fixed update frame
function endFrame () {
	// we've processed all events that were ready this frame. move all queued events into the ready set

	// unreference all the objects in the buffer so they can be freed by the gc as needed
	for (let i=0; i < buffer.length; i++) {
		buffer.buf[i].type = undefined
		buffer.buf[i].entity = undefined
		buffer.buf[i].args = undefined
	}

	// handle scheduled events
	for (let i=0; i < MAX_EVENT_COUNT; i++) {
		const evt = _scheduled.buf[i]
		if (evt.tickTTL <= 0)
			continue

		evt.tickTTL--
		if (evt.tickTTL === 0) {
			// this event is ready to be fired, so put it in the staged list
			add(evt.type, evt.entity, ...evt.args)
			evt.tickTTL--
		}
	}
	
	// swap the staged events into the current event buffer.
	// on the next event loop all of these events are available
	const tmp = buffer.buf
	buffer.buf = _staged.buf
	_staged.buf = tmp

	buffer.length = _staged.length
	_staged.length = 0
}


export default { buffer, add, schedule, endFrame }
