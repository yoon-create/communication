gsap.registerPlugin(ScrollTrigger);

let iteration = 0; // 끝이나 시작까지 스크롤을 할 때 반복되며, 계속 부드럽게 재생 헤드를 올바른 방향으로 스크럽할 수 있게 함.

const spacing = 0.4,    // 카드 간의 간격 (스태거)
	snap = gsap.utils.snap(spacing), // seamlessLoop에서 재생 헤드를 스냅하기 위해 사용
	cards = gsap.utils.toArray('.cards li'),
	seamlessLoop = buildSeamlessLoop(cards, spacing),
	scrub = gsap.to(seamlessLoop, { // seamlessLoop의 재생 헤드를 부드럽게 스크럽하는 트윈을 재사용
		totalTime: 0,
		duration: 0.8,
		ease: "power3",
		paused: true
	}),
	trigger = ScrollTrigger.create({
		start: 0,
		onUpdate(self) {
			if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
				wrapForward(self); // 스크롤이 끝에 도달하면 앞으로 랩핑
			} else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
				wrapBackward(self); // 스크롤이 처음에 도달하면 뒤로 랩핑
			} else {
        scrub.vars.totalTime = snap((iteration + self.progress) * seamlessLoop.duration());
				scrub.invalidate().restart(); // 성능을 개선하기 위해 스크럽 트윈을 무효화하고 다시 시작
				self.wrapping = false;
			}
		},
		end: "+=3000",
		pin: ".gallery"
	});

function wrapForward(trigger) { // ScrollTrigger가 끝에 도달하면, 처음으로 돌아가며 부드럽게 루프
	iteration++;
	trigger.wrapping = true;
	trigger.scroll(trigger.start + 1);
}

function wrapBackward(trigger) { // ScrollTrigger가 처음에 도달하면, 끝으로 돌아가며 부드럽게 루프
	iteration--;
	if (iteration < 0) { // 시작 지점에서 정지하지 않도록 하기 위해 10번 앞당긴다.
		iteration = 9;
		seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10);
    scrub.pause(); // 그렇지 않으면, 트리거가 업데이트되기 전에 totalTime이 변경되어 시작값이 달라질 수 있다.
	}
	trigger.wrapping = true;
	trigger.scroll(trigger.end - 1);
}

function scrubTo(totalTime) { // totalTime 값에 맞는 위치로 스크롤을 이동시키고 필요 시 랩핑
	let progress = (totalTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();
	if (progress > 1) {
		wrapForward(trigger); // 범위를 넘으면 앞쪽으로 랩핑
	} else if (progress < 0) {
		wrapBackward(trigger); // 범위를 벗어나면 뒤로 랩핑
	} else {
		trigger.scroll(trigger.start + progress * (trigger.end - trigger.start));
	}
}

document.querySelector(".next").addEventListener("click", () => scrubTo(scrub.vars.totalTime + spacing));
document.querySelector(".before").addEventListener("click", () => scrubTo(scrub.vars.totalTime - spacing));




function buildSeamlessLoop(items, spacing) {
	let overlap = Math.ceil(1 / spacing), // seamless 루프를 위한 시작/끝 부분에 추가 애니메이션을 생성하기 위한 값
		startTime = items.length * spacing + 0.5, // seamless 루프가 시작될 때의 rawSequence에서의 시간
		loopTime = (items.length + overlap) * spacing + 1, // 루프가 끝날 때의 시간
		rawSequence = gsap.timeline({paused: true}), // 실제 애니메이션이 들어있는 곳
		seamlessLoop = gsap.timeline({ // 이곳은 rawSequence의 재생 헤드를 스크럽하여 무한 루프처럼 보이게 만든다.
			paused: true,
			repeat: -1, // 무한 스크롤/루프를 위해
			onRepeat() { // 아주 드문 버그를 해결하기 위한 코드 (GSAP 3.6.1에서 해결됨)
				this._time === this._dur && (this._tTime += this._dur - 0.01);
			}
		}),
		l = items.length + overlap * 2,
		time = 0,
		i, index, item;

	// 아이템의 초기 상태 설정
	gsap.set(items, {xPercent: 400, opacity: 0,	scale: 0});

	// 이제 스태거 방식으로 애니메이션을 추가. seamless 루프를 위해 끝에 EXTRA 애니메이션을 추가해야 한다.
	for (i = 0; i < l; i++) {
		index = i % items.length;
		item = items[index];
		time = i * spacing;
		rawSequence.fromTo(item, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false}, time)
		           .fromTo(item, {xPercent: 400}, {xPercent: -400, duration: 1, ease: "none", immediateRender: false}, time);
		i <= items.length && seamlessLoop.add("label" + i, time); // 실제로 필요하지 않지만, 레이블을 통해 특정 지점으로 점프할 수 있게 해주는 부분
	}
	
	// 이제 무한 루프처럼 보이게 하기 위해 재생 헤드를 스크럽 설정
	rawSequence.time(startTime);
	seamlessLoop.to(rawSequence, {
		time: loopTime,
		duration: loopTime - startTime,
		ease: "none"
	}).fromTo(rawSequence, {time: overlap * spacing + 1}, {
		time: startTime,
		duration: startTime - (overlap * spacing + 1),
		immediateRender: false,
		ease: "none"
	});
	return seamlessLoop;
} 
