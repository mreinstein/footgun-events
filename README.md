# @footgun/events
A data oriented poll-based event scheduler.

This has proved useful in systems that poll at regular intervals, because it provides exact control over _when_ event handlers will run.


## usage

```javascript
import Events from '@footgun/events'


function simLoop () {

	// run all systems
	soundSystemTick()
	particleSystemTick()
   	inputTick()

	Events.endFrame()  // important! clears events and schedules queued events

	requestAnimationFrame(simLoop)
}


requestAnimationFrame(simLoop)


function soundSystemTick () {
	// read all events
    for (let i=0; i < Events.buffer.length; i++) {
    	const e = Events.buffer.buf[i]
    	if (e.type === 'jump') {
    		// e.entity
    		// e.args
    		playJumpSoundEffect()
    	}
    }
}


function particleSystemTick () {
	for (let i=0; i < Events.buffer.length; i++) {
    	const e = Events.buffer.buf[i]
    	if (e.type === 'jump') {
    		// e.entity
    		// e.args
    		spawnJumpParticles()
    	}
    }
}


function inputTick () {
	// other logic omitted for brevity

	if (jumpButtonPressed && canJump) {
		const entity = { } // optional context data you with to reference in the event
	    //                               append any other data you'd like as arguments here               
	    Events.add('jump', entity, 'arg1', 'arg2')
	}
}

```


## scheduling events
You can schedule events in the future:

```javascript

const tickCount = 50
const eventName = 'some_example'
Events.schedule(tickCount, eventName)
```

This will cause the event named `some_example` to appear in the Events buffer after `<tickCount>` ticks have elapsed. 
The tick is incremented every time `Events.endFrame()` is called.

