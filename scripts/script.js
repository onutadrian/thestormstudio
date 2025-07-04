'use strict'

const lenis = new Lenis({
    autoRaf: true,
});

gsap.registerPlugin(Flip, ScrollTrigger, Draggable, InertiaPlugin, SplitText)

// Global scroll direction detection
let scrollDirection = null;
lenis.on('scroll', (e) => {
    scrollDirection = e.direction
})

// Sleep function (to be used for delays)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// isDesktop detect (based on screen width)
let mobileBreakpoint = 1024; //px
let isDesktop = window.innerWidth > mobileBreakpoint;

// switchedToDesktop / switchedToMobile custom events (based on screen width) and isDesktop updater 
window.addEventListener('resize', () => {
    let isResizeDesktop = window.innerWidth > mobileBreakpoint;
    if (isResizeDesktop !== isDesktop) {
        if (isResizeDesktop) {
            const evt = new CustomEvent('switchedToDesktop', {})
            window.dispatchEvent(evt);
        } else {
            const evt = new CustomEvent('switchedToMobile', {})
            window.dispatchEvent(evt);
        }
        isDesktop = isResizeDesktop;
    }
});

// Text Animations
// text-animation="word-reveal, chars, false, 0"

function textAnimations() {
    let wordRevealElements = document.querySelectorAll('[text-animation*="word-reveal"]');

    Array.from(wordRevealElements).forEach(element => {
        let properties = element.getAttribute(`text-animation`).split(`, `);
        //properties = animation type, split type, instant/on-scroll


        let split = SplitText.create(element, {
            type: properties[1],
            mask: properties[1],
            smartWrap: true
        });

        let toBeAnimated = null;

        switch (properties[1]) {
            case `lines`:
                toBeAnimated = split.lines
                break;
            case `words`:
                toBeAnimated = split.words
                break;
            case `chars`:
                toBeAnimated = split.chars
                break;
        }

        gsap.from(toBeAnimated, {
            y: -100,
            duration: 0.6,
            stagger: 0.01,
            delay: 0,
            ease: `power3.out`,
            delay: 2
        })

    })
}

textAnimations()

// Helper Variables
// scrollDirection = 1 (down) / -1 (up)
// mobileBreakpoint
// isDesktop = true / false

// Helper Functions
// sleep(ms)
// Text Animations

// Helper Custom Events
// document.addEventListener(`switchedToDesktop`)
// document.addEventListener(`switchedToMobile`)

function pageReveal() {
    let pageReveal = document.querySelector(`.page-reveal`)
    let topPart = pageReveal.querySelector(`._top`)
    let bottomPart = pageReveal.querySelector(`._bottom`)

    let logoElement = pageReveal.querySelector(`._logo`)
    let textElement = pageReveal.querySelector(`._text`)

    let animationTimeline = gsap.timeline()

    animationTimeline.fromTo(logoElement, {
            y: -24,
            autoAlpha: 0
        }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            delay: 0.4
        })
        .fromTo(textElement, {
            y: 24,
            autoAlpha: 0
        }, {
            y: 0,
            autoAlpha: 1,
        }, `<`)
        .to(topPart, {
            y: `-100%`,
            duration: 1.2,
            ease: `power3.inOut`,
            delay: 2.5
        })
        .to(bottomPart, {
            y: `100%`,
            duration: 1.2,
            ease: `power3.inOut`,
            onComplete: () => {
                gsap.to(pageReveal, {
                    display: `none`,
                })
            },
        }, `<`)
        .to(logoElement, {
            autoAlpha: 0,
            duration: 0.2
        }, "<-=0.4")
        .to(textElement, {
            autoAlpha: 0,
            duration: 0.2
        }, "<")


    let homeHero = document.querySelector(`.homepage-hero`)

    if (homeHero) {
        let homeHeroPreheading = homeHero.querySelector(`._pre-heading`)
        let homeHeroHeading = homeHero.querySelector(`._heading`)

        let headingSplit = SplitText.create(homeHeroHeading, {
            type: `chars`,
            mask: `chars`,
            smartWrap: true
        });

        animationTimeline.from(headingSplit.chars, {
            y: `-110%`,
            autoAlpha: 0,
            duration: 1.4,
            stagger: 0.02,
            ease: `power3.inOut`,
        }, `<+=0.6`)
    }

}

pageReveal()

function projectsSection() {
    let homepageHeroElement = document.querySelector(`.homepage-hero`)

    let projectsSectionElement = document.querySelector(`.projects-section`)
    let stickyWarpperElement = projectsSectionElement.querySelector(`._sticky-wrapper`)
    let projectsWrapperElement = document.querySelector(`._projects-wrapper`)

    let projectItemElements = projectsWrapperElement.querySelectorAll(`._project-item`);

    let previousProject = null;

    let animationTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: projectsSectionElement,
            start: "0% 50%",
            end: "100% 40%",
            scrub: true,
            //markers: true
            onUpdate: self => {

                let topEnterAlignInProgress = false;
                let bottomEnterAlignInProgress = false;

                // top enter align
                if (self.progress > 0.32 && self.progress < 0.39 && !topEnterAlignInProgress && scrollDirection == 1) {
                    topEnterAlignInProgress = true;

                    const trigger = animationTimeline.scrollTrigger;
                    const scollToPos = trigger.start + 0.4 * (trigger.end - trigger.start); // scrollToPos = 40% of timeline

                    lenis.scrollTo(scollToPos, {
                        onComplete: () => {
                            topEnterAlignInProgress = false;
                        }
                    })
                }

                //bottom enter align
                if (self.progress < 0.56 && self.progress > 0.51 && !bottomEnterAlignInProgress && scrollDirection == -1) {
                    bottomEnterAlignInProgress = true;

                    const trigger = animationTimeline.scrollTrigger;
                    const scollToPos = trigger.start + 0.5 * (trigger.end - trigger.start); // scrollToPos = 40% of timeline

                    lenis.scrollTo(scollToPos, {
                        onComplete: () => {
                            bottomEnterAlignInProgress = false;
                        }
                    })
                }
            }
        }
    });

    animationTimeline.fromTo(stickyWarpperElement, {
            y: 160,
            width: "80%",
            borderRadius: "32px"
        }, {
            y: 0,
            width: "100%",
            borderRadius: "0px",
            duration: 0.4
        })
        .fromTo(projectsWrapperElement, {
            autoAlpha: 0,
            y: 48
        }, {
            autoAlpha: 1,
            duration: 0.2,
            y: 0
        }, "<+=0.2")
        .to(homepageHeroElement, {
            autoAlpha: 0,
            duration: 0.2,
        }, "<")
        .to({}, {
            duration: 0.2
        })
        .to(stickyWarpperElement, {
            y: -160,
            width: "80%",
            borderRadius: "32px",
            duration: 0.4
        })
        .to(projectsWrapperElement, {
            autoAlpha: 0,
            duration: 0.1
        }, "<")

    function updateAndAnimateProjectTags(tags) {
        let tagsWrapperElement = document.querySelector(`.projects-section`).querySelector(`._tags-wrapper`)
        tagsWrapperElement.innerHTML = ``;

        let tagsArray = tags.split(`, `);

        tagsArray.forEach(tag => {
            tagsWrapperElement.innerHTML += `<div class="_tag">${tag}</div>`
        })

        let newTagElements = tagsWrapperElement.querySelectorAll(`._tag`)

        gsap.from(Array.from(newTagElements), {
            autoAlpha: 0,
            y: 24,
            stagger: 0.1,
            duration: 0.4,
            ease: `power3.out`
        })
    }

    function activateProjectItem(projectElement) {
        let videoID = projectElement.getAttribute(`video-id`);
        let videoElement = document.getElementById(videoID)

        let titleElement = projectElement.querySelector(`._title`)
        let titleIconElement = projectElement.querySelector(`._icon`)
        let titleIconSVGs = projectElement.querySelectorAll(`svg`)

        let projectTags = projectElement.getAttribute(`tags`);
        updateAndAnimateProjectTags(projectTags)

        gsap.to(videoElement, {
            autoAlpha: 0.6,
            duration: 0.2
        })

        videoElement.play();

        gsap.to(titleElement, {
            autoAlpha: 1,
            duration: 0.2
        })

        gsap.to(titleIconElement, {
            autoAlpha: 1,
            duration: 0.2
        })

        //gsap.from(Array.from(titleIconSVGs), {
        //    y: `100%`,
        //    x: `-100%`,
        //    duration: 0.3,
        //    ease: "power1.out",
        //})

    }

    function deactivateProjectItem(projectElement) {
        let videoID = projectElement.getAttribute(`video-id`);
        let videoElement = document.getElementById(videoID)

        let titleElement = projectElement.querySelector(`._title`)
        let titleIconElement = projectElement.querySelector(`._icon`)

        gsap.to(videoElement, {
            autoAlpha: 0,
            duration: 0.2
        })

        videoElement.pause();

        gsap.to(titleElement, {
            autoAlpha: 0.2,
            duration: 0.2
        })

        gsap.to(titleIconElement, {
            autoAlpha: 0,
            duration: 0.2
        })
    }

    Array.from(projectItemElements).forEach(projectItem => {

        //let matchMedia = gsap.matchMedia();
        //
        //matchMedia.add(`(max-width: ${mobileBreakpoint}px)`, () => {
        //
        //});


        projectItem.addEventListener(`pointerenter`, () => {

            if (previousProject == projectItem) return;

            if (previousProject) {
                deactivateProjectItem(previousProject)
            }

            activateProjectItem(projectItem)

            previousProject = projectItem

        })

    })

    activateProjectItem(projectItemElements[0])
    previousProject = projectItemElements[0]

}

projectsSection()

function becauseWeAnimation() {

    let whyWorkWithUsElement = document.querySelector(`.why-work-with-us`)
    if (!whyWorkWithUsElement) return;

    let animationWrapper = whyWorkWithUsElement.querySelector(`._animation-wrapper`)
    let headingElement = animationWrapper.querySelector(`._we`)

    let animationTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: animationWrapper,
            start: `0% 40%`,
            end: `90% 40%`,
            scrub: true,
            //markers: true,
            pin: headingElement,
            pinSpacing: false
        }
    })

    let textToHide = headingElement.querySelectorAll(`._hide`)

    animationTimeline.to(Array.from(textToHide), {
            opacity: 0,
            duration: 0.1
        })
        .to({}, {
            duration: 0.9
        })
        .to(headingElement, {
            opacity: 0,
            duration: 0.1
        })

    let reasonElements = animationWrapper.querySelectorAll(`._reason`)

    Array.from(reasonElements).forEach(reasonElement => {
        let content = reasonElement.querySelector(`._content`)
        let number = content.querySelector(`._number`)
        let text = content.querySelector(`._text`)

        gsap.fromTo(number, {
            autoAlpha: 0,
            y: -24,
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: `power3.inOut`,
            scrollTrigger: {
                trigger: reasonElement,
                start: `0% 55%`,
                end: `100% 55%`,
                //markers: true,
            }
        })

        let textSplit = SplitText.create(text, {
            type: `words`,
            mask: `words`,
            smartWrap: true
        });

        gsap.fromTo(textSplit.words, {
            autoAlpha: 0,
            y: -24,
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.02,
            ease: `power3.inOut`,
            scrollTrigger: {
                trigger: reasonElement,
                start: `0% 55%`,
                end: `100% 55%`,
                //markers: true,
            }
        })

        gsap.to(text, {
            opacity: 0.5,
            duration: 0.4,
            ease: `power3.inOut`,
            scrollTrigger: {
                trigger: reasonElement,
                start: `0% 30%`,
                end: `100% 60%`,
                //markers: true,
                toggleActions: "play none reverse none",
            }

        })
    })
}

becauseWeAnimation()