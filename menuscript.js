const navContent = document.querySelector('.nav__content');
const nav = document.querySelector('.nav');
const extraBackground = document.querySelector('.navbackground');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelectorAll('.nav__links a');
const navLocations = document.querySelector('.nav__locations');
const navText = document.querySelector('.nav__text');
const html = document.querySelector('html');


//Setting the initial states
gsap.set([extraBackground, nav], { height: '0%', skewY: 0 });
gsap.set([navLinks, navLocations, navText], { y: -20, autoAlpha: 0 });

const hamburgerAnimation = hamburger => {
    const tl = gsap.timeline();
    const lineOne = hamburger.children[0]
    const lineTwo = hamburger.children[1]
    const lineThree = hamburger.children[2]
    
    tl.to(lineOne, {
        duration: 0.2,

    }).to(lineTwo, {
        duration: 0.2,
        opacity: 0,
    }).to(lineThree, {
        duration: 0.2,

    }, '-=0.2')
    
    return tl;
}

const staggerReveal = nodes => {
    const tl = gsap.timeline();
    
    tl.to(nodes, {
        duration: 1,
        ease: 'power3.inOut',
        transformOrigin: 'top right',
        height: '100%',
        minHeight: '100%',
        skewY: 0,
        stagger: {
            amount: 0.1,
        },
    });

    return tl;
};



const revealMenuItems = links => {
    const tl = gsap.timeline();

    tl.to(links, {
        duration: 0.8,
        autoAlpha: 1,
        y: 0,
        stagger: {
            amount: 0.1,
        },
    });

    return tl;
};

const master = gsap.timeline({ paused: true, reversed: true });
master
    .add(staggerReveal([extraBackground, nav]))
    .add(revealMenuItems([navLinks, navLocations, navText]), '-=0.5')


hamburger.addEventListener('click', () => {
    master.reversed() ? master.play() : master.reverse();
    hamburger.classList.toggle('hamburger__open');
});