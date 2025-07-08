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



function createBlob(blobElement, blobContent, hoverElements, blobSize, ) {

    //blobElement always getElementsByClassName(`x`)[0]
    //blobContent always getElementsByClassName(`x`)[0]
    //hoverElements always querySelectorAll(`x`) even if only one
    //blobSize width of blob int value

    gsap.set(blobElement, {
        transformOrigin: 'center center'
    });

    let blobState = {
        active: 0
    };

    hoverElements.forEach(hoverElement => {
        hoverElement.addEventListener(`pointerenter`, async () => {

            if (!isDesktop) return;

            gsap.to(blobState, {
                active: 1,
                duration: 0.3
            });
        })

        hoverElement.addEventListener(`pointerleave`, async () => {

            if (!isDesktop) return;

            gsap.to(blobState, {
                active: 0,
                duration: 0.3,
                ease: 'power1.out'
            });
        })
    })

    function getAngle(dx, dy) {
        return (Math.atan2(dy, dx) * 180) / Math.PI;
    }

    function getScale(dx, dy) {
        let dist = Math.hypot(dx, dy);
        return Math.min(dist / 1200, 0.35);
    }

    let pos = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };
    let vel = {
        x: 0,
        y: 0
    };

    let set = {
        x: gsap.quickSetter(blobElement, "x", "px"),
        y: gsap.quickSetter(blobElement, "y", "px"),
        width: gsap.quickSetter(blobElement, "width", "px"),
        r: gsap.quickSetter(blobElement, "rotation", "deg"),
        sx: gsap.quickSetter(blobElement, "scaleX"),
        sy: gsap.quickSetter(blobElement, "scaleY"),
        rt: gsap.quickSetter(blobContent, "rotation", "deg")
    };

    function updateBlob() {
        let rotation = getAngle(vel.x, vel.y);
        let scale = getScale(vel.x, vel.y);

        set.x(pos.x);
        set.y(pos.y);
        set.width(blobSize + scale * 150);
        set.r(rotation);
        set.sx((1 + scale) * blobState.active);
        set.sy((1 - scale) * blobState.active);
        set.rt(-rotation);
    }

    gsap.ticker.add(updateBlob);

    window.addEventListener("mousemove", (e) => {
        let x = e.clientX,
            y = e.clientY;
        gsap.to(pos, {
            x,
            y,
            duration: 1,
            ease: "expo.out",
            onUpdate: () => {
                vel.x = x - pos.x;
                vel.y = y - pos.y;
            }
        });

        updateBlob();
    });
}

// Helper Variables
// scrollDirection = 1 (down) / -1 (up)
// mobileBreakpoint
// isDesktop = true / false

// Helper Functions
// sleep(ms)
// Text Animations
// Create Blob

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
            //ers: true,
            pin: headingElement,
            pinSpacing: false
        }
    })

    animationTimeline.to({}, {
            duration: 0.9
        })
        .to(headingElement, {
            opacity: 0,
            duration: 0.1
        }, `<+=0.75"`)

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

function testimonialsSection() {
    let testimonialsSection = document.querySelector(`.testimonials`)
    let testimonialsItems = testimonialsSection.querySelectorAll(`._testimonial-items ._item`)

    let progressBar = testimonialsSection.querySelector(`._progress ._current`)

    let currentTestimonialIndex = 0;
    let testimonialsObjects = []

    Array.from(testimonialsItems).forEach(item => {
        let addToTestimonialsObjects = {
            "quote": `${item.querySelector(`._quote`).innerHTML}`,
            "name": `${item.querySelector(`._name`).innerHTML}`,
            "company": `${item.querySelector(`._company`).innerHTML}`,
            "position": `${item.querySelector(`._position`).innerHTML}`,
            "imageId": `${item.getAttribute(`image-id`)}`,
            "caseStudyLink": `${item.getAttribute(`case-study-link`)}`
        }

        testimonialsObjects.push(addToTestimonialsObjects)
    })

    let quoteElement = testimonialsSection.querySelector(`._quote`)
    let nameElement = testimonialsSection.querySelector(`._name`)
    let companyElement = testimonialsSection.querySelector(`._company`)
    let positionElement = testimonialsSection.querySelector(`._position`)
    let ctaButton = testimonialsSection.querySelector(`.cta-button`)

    function switchTestimonial(testimonialItem) {

        let oldImage = testimonialsSection.querySelector(`#${testimonialItem.imageId}`)

        let newImage;
        let newTestimonialItem;

        let animationTimeline = gsap.timeline()

        animationTimeline.to(quoteElement, {
                duration: 0.4,
                y: -24,
                autoAlpha: 0
            })
            .to(nameElement, {
                duration: 0.3,
                y: -24,
                autoAlpha: 0
            }, `<+=0.2`)
            .to(ctaButton, {
                duration: 0.3,
                y: -24,
                autoAlpha: 0
            }, `<`)
            .to(companyElement, {
                duration: 0.3,
                y: -24,
                autoAlpha: 0
            }, `<+=0.1`)
            .to(positionElement, {
                duration: 0.3,
                y: -24,
                autoAlpha: 0
            }, `<+=0.1`)
            .to(oldImage, {
                duration: 0.3,
                autoAlpha: 0,
            }, `<+=0.1`)
            .to({}, {
                onComplete: function () {

                    currentTestimonialIndex++;

                    if (currentTestimonialIndex > testimonialsObjects.length - 1) {
                        currentTestimonialIndex = 0;
                    }

                    newTestimonialItem = testimonialsObjects[currentTestimonialIndex]

                    console.log(newTestimonialItem.imageId)

                    newImage = testimonialsSection.querySelector(`#${newTestimonialItem.imageId}`)

                    console.log(newImage)
                    console.log(`----------------`)

                    quoteElement.innerHTML = newTestimonialItem.quote
                    nameElement.innerHTML = newTestimonialItem.name
                    companyElement.innerHTML = newTestimonialItem.company
                    positionElement.innerHTML = newTestimonialItem.position
                }
            }, `<`)
            .to(newImage, {
                duration: 0.3,
                autoAlpha: 1,

            })
            .to(quoteElement, {
                duration: 0.4,
                y: 0,
                autoAlpha: 1
            })
            .to(nameElement, {
                duration: 0.3,
                y: 0,
                autoAlpha: 1
            }, `<+=0.2`)
            .to(ctaButton, {
                duration: 0.3,
                y: 0,
                autoAlpha: 1
            }, `<`)
            .to(companyElement, {
                duration: 0.3,
                y: 0,
                autoAlpha: 1
            }, `<+=0.1`)
            .to(positionElement, {
                duration: 0.3,
                y: 0,
                autoAlpha: 1
            }, `<+=0.1`)
    }

    gsap.to(progressBar, {
        duration: 10,
        width: `100%`,
        ease: `none`,
        repeat: -1,
        onRepeat: function () {
            switchTestimonial(testimonialsObjects[currentTestimonialIndex])
        }
    })
}



async function indexToProjectTransitionLeave(trigger) {
    if (!trigger.hasAttribute(`video-id`)) {
        return
    };

    let videoID = trigger.getAttribute(`video-id`);
    let videoElement = document.querySelector(`#${videoID}`);

    let transitionWrapper = document.querySelector(`.video-transition-wrapper`);

    let state = Flip.getState(videoElement)

    transitionWrapper.appendChild(videoElement)

    gsap.to(transitionWrapper, {
        display: `block`,
        autoAlpha: 1,
        duration: 0
    })

    await Flip.from(state, {
        duration: 0.3
    })

    await gsap.to(videoElement, {
        autoAlpha: 1,
        duration: 0.3
    });


}

function initBlobs(container = document) {

    let footerBlobElement = container.querySelector(`._contact-blob`);

    if (footerBlobElement) {
        let footerBlobContent = footerBlobElement.querySelector(`._content`);
        let footerHoverElement = container.querySelectorAll(`._get-in-touch`);
        createBlob(footerBlobElement, footerBlobContent, footerHoverElement, 180)
    }
}

barba.init({
    transitions: [{
        name: 'projectTransition',
        async leave(data) {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());

            const triggeredElement = data.trigger;
            if (triggeredElement) {
                console.log(triggeredElement)
                await indexToProjectTransitionLeave(triggeredElement);
            }
        }
    }],
    views: [{
            namespace: 'home',
            beforeEnter(data) {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());

                textAnimations(data.next.container)
                initBlobs(data.next.container)
                pageReveal(data.next.container)
                projectsSection(data.next.container)
                becauseWeAnimation(data.next.container)
                testimonialsSection(data.next.container)

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        ScrollTrigger.refresh();
                    });
                });
            }
        },
        {
            namespace: 'project',
            afterEnter(data) {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());

                indexToProjectTransitionEnter();

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        ScrollTrigger.refresh();
                    });
                });
            }
        }
    ]
});