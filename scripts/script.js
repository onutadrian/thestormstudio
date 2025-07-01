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

// Helper Variables
// scrollDirection = 1 (down) / -1 (up)
// mobileBreakpoint
// isDesktop = true / false

// Helper Functions
// sleep(ms)

// Helper Custom Events
// document.addEventListener(`switchedToDesktop`)
// document.addEventListener(`switchedToMobile`)

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
        console.log(projectElement)
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

function textAnimations() {
    let textAnimElements = document.querySelectorAll(`.text-anim`);

    
}