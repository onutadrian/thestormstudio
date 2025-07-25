'use strict'

const lenis = new Lenis({
    autoRaf: true,
    overscroll: false,
    prevent: (node) => node.id === "caseStudyOverlayScroll",
    anchors: {
        offset: -96
    }
});

gsap.registerPlugin(Flip, ScrollTrigger, Draggable, InertiaPlugin, SplitText)

// Global scroll direction detection
let scrollDirection = null;
lenis.on('scroll', (e) => {
    scrollDirection = e.direction
})

// isScrollProgrammatic to diferentiate between user an non-user scroll
let isScrollProgrammatic = false;

// Disable scroll restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Sleep function (to be used for delays)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// isDesktop detect (based on screen width)
let mobileBreakpoint = 1024; //px
let isDesktop = window.innerWidth > mobileBreakpoint;

// should the page scroll to top after page change
let scrollToTop = false;

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
// isScrollProgrammatic = true/false

// Helper Functions
// sleep(ms)
// Text Animations
// Create Blob

// Helper Custom Events
// document.addEventListener(`switchedToDesktop`)
// document.addEventListener(`switchedToMobile`)

function pageReveal() {
    let pageReveal = document.querySelector(`.page-reveal`)

    if (!pageReveal) {
        return;
    }

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

}

function projectsSection(container = document) {

    let matchMedia = gsap.matchMedia();

    let headerWrapperElement = container.querySelector(`.header-wrapper`)
    let homepageHeroElement = container.querySelector(`.homepage-hero`)

    let projectsSectionElement = container.querySelector(`.projects-section`)
    let stickyWarpperElement = projectsSectionElement.querySelector(`._sticky-wrapper`)
    let projectsWrapperElement = container.querySelector(`._projects-wrapper`)

    let projectItemElements = projectsWrapperElement.querySelectorAll(`._project-item`);

    let previousProject = null;

    matchMedia.add(`(min-width: ${mobileBreakpoint}px)`, () => { //only run on desktop

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
                        const scollToPos = trigger.start + 0.5 * (trigger.end - trigger.start); // scrollToPos = 40% of timeline


                        isScrollProgrammatic = true;
                        lenis.scrollTo(scollToPos, {
                            onComplete: () => {
                                isScrollProgrammatic = false;
                                topEnterAlignInProgress = false;
                            }
                        })

                        //programaticallyScrollTo(scollToPos, {
                        //    onComplete: () => {
                        //        topEnterAlignInProgress = false;
                        //    }
                        //})
                    }

                    //bottom enter align
                    if (self.progress < 0.56 && self.progress > 0.51 && !bottomEnterAlignInProgress && scrollDirection == -1) {
                        bottomEnterAlignInProgress = true;

                        const trigger = animationTimeline.scrollTrigger;
                        const scollToPos = trigger.start + 0.5 * (trigger.end - trigger.start); // scrollToPos = 40% of timeline

                        isScrollProgrammatic = true;
                        lenis.scrollTo(scollToPos, {
                            onComplete: () => {
                                isScrollProgrammatic = false;
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
            .to(headerWrapperElement, {
                autoAlpha: 0,
                duration: 0.1
            }, `<+=0.3`)
            .fromTo(projectsWrapperElement, {
                autoAlpha: 0,
                y: 48
            }, {
                autoAlpha: 1,
                duration: 0.2,
                y: 0
            }, "<")
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
            .to(headerWrapperElement, {
                autoAlpha: 1,
                duration: 0.1
            }, `<+=0.3`)

    });

    function updateAndAnimateProjectTags(tags) {
        let tagsWrapperElement = container.querySelector(`.projects-section`).querySelector(`._tags-wrapper`)
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
        let videoElement = container.querySelector(`#${videoID}`)

        let titleElement = projectElement.querySelector(`._title`)
        let titleIconElement = projectElement.querySelector(`._icon`)
        let titleIconSVGs = projectElement.querySelectorAll(`svg`)

        let projectTags = projectElement.getAttribute(`tags`);
        updateAndAnimateProjectTags(projectTags)

        gsap.to(videoElement, {
            autoAlpha: 0.2,
            duration: 0.2
        })

        videoElement.play();

        gsap.to(titleElement, {
            autoAlpha: 1,
            duration: 0.2,
            color: `#ffffff`
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
        let videoElement = container.querySelector(`#${videoID}`)

        let titleElement = projectElement.querySelector(`._title`)
        let titleIconElement = projectElement.querySelector(`._icon`)

        gsap.to(videoElement, {
            autoAlpha: 0,
            duration: 0.2
        })

        videoElement.pause();

        gsap.to(titleElement, {
            autoAlpha: 1,
            color: `#8B8B8B`,
            duration: 0.2
        })

        gsap.to(titleIconElement, {
            autoAlpha: 0,
            duration: 0.2
        })
    }

    let pointerEnterEvent = new PointerEvent('pointerenter', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    Array.from(projectItemElements).forEach(projectItem => {

        matchMedia.add(`(max-width: ${mobileBreakpoint}px)`, () => {
            gsap.to(projectItem, {
                scrollTrigger: {
                    trigger: projectItem,
                    start: "center center",
                    end: "center center",
                    scrub: true,
                    //markers: true,
                    onEnter: () => {
                        projectItem.dispatchEvent(pointerEnterEvent);
                    },
                    onEnterBack: () => {
                        projectItem.dispatchEvent(pointerEnterEvent);
                    }
                }
            });
        });

        projectItem.addEventListener(`pointerenter`, () => {

            if (previousProject == projectItem) return;

            if (previousProject) {
                deactivateProjectItem(previousProject)
            }

            activateProjectItem(projectItem)

            previousProject = projectItem
        })

        window.addEventListener('switchedToDesktop', () => {
            deactivateProjectItem(projectItem);
        });

        window.addEventListener('switchedToMobile', () => {
            deactivateProjectItem(projectItem)
        });

    })

    window.addEventListener('switchedToDesktop', () => {
        activateProjectItem(previousProject);
    });

    activateProjectItem(projectItemElements[0])
    previousProject = projectItemElements[0]

}

function becauseWeAnimation() {

    let mm = gsap.matchMedia();

    mm.add(`(min-width: ${mobileBreakpoint}px)`, () => {

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

    });
}

function testimonialsSection(container = document) {

    let mm = gsap.matchMedia();

    let testimonialsSection = container.querySelector(`.testimonials`)

    if (!testimonialsSection) {
        return;
    }

    let testimonialsItems = testimonialsSection.querySelectorAll(`._testimonial-items ._item`)

    let progressBar = testimonialsSection.querySelector(`._progress ._current`)

    let currentTestimonialIndex = 0;
    let testimonialsObjects = []
    let imageElements = {}

    Array.from(testimonialsItems).forEach(item => {
        let addToTestimonialsObjects = {
            "quote": `${item.querySelector(`._quote`).innerHTML}`,
            "name": `${item.querySelector(`._name`).innerHTML}`,
            "company": `${item.querySelector(`._company`).innerHTML}`,
            "position": `${item.querySelector(`._position`).innerHTML}`,
            "imageElement": testimonialsSection.querySelector(`#${item.getAttribute("image-id")}`),
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

        let oldImage = testimonialItem.imageElement

        currentTestimonialIndex++;

        if (currentTestimonialIndex > testimonialsObjects.length - 1) {
            currentTestimonialIndex = 0;
        }

        let newTestimonialItem = testimonialsObjects[currentTestimonialIndex]
        let newImage = newTestimonialItem.imageElement

        ctaButton.setAttribute(`href`, testimonialItem.caseStudyLink)

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
            .to(ctaButton, {
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
                    quoteElement.innerHTML = newTestimonialItem.quote
                    nameElement.innerHTML = newTestimonialItem.name
                    companyElement.innerHTML = newTestimonialItem.company
                    positionElement.innerHTML = newTestimonialItem.position
                }
            }, `<`)
            .to(newImage, {
                duration: 0.3,
                autoAlpha: 1,
            }, `<`)
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
            .to(ctaButton, {
                duration: 0.3,
                y: 0,
                autoAlpha: 1
            }, `<+=0.1`)
    }

    gsap.to(progressBar, {
        duration: 8,
        width: `100%`,
        ease: `none`,
        repeat: -1,
        onRepeat: function () {
            switchTestimonial(testimonialsObjects[currentTestimonialIndex])
        }
    })

    let headerWrapperElement = container.querySelector(`.header-wrapper`)


    mm.add(`(min-width: ${mobileBreakpoint}px)`, () => {

        let snapTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: testimonialsSection,
                start: "0% 15%",
                end: "100% 85%",
                scrub: true,
                //markers: true,
                onUpdate: self => {

                    let topEnterAlignInProgress = false;
                    let bottomEnterAlignInProgress = false;

                    // top enter align
                    if (self.progress > 0 && self.progress < 0.3 && !topEnterAlignInProgress && scrollDirection == 1) {
                        topEnterAlignInProgress = true;

                        const scollToPos = testimonialsSection.getBoundingClientRect().top + window.pageYOffset;

                        isScrollProgrammatic = true;

                        lenis.scrollTo(scollToPos, {
                            onComplete: () => {
                                isScrollProgrammatic = false;
                                topEnterAlignInProgress = false;
                            }
                        })
                    }

                    //bottom enter align
                    if (self.progress < 1 && self.progress > 0.7 && !bottomEnterAlignInProgress && scrollDirection == -1) {
                        bottomEnterAlignInProgress = true;

                        const scollToPos = testimonialsSection.getBoundingClientRect().top + window.pageYOffset;

                        isScrollProgrammatic = true;

                        lenis.scrollTo(scollToPos, {
                            onComplete: () => {
                                isScrollProgrammatic = false;
                                bottomEnterAlignInProgress = false;
                            }
                        })
                    }
                }
            }
        });

        snapTimeline.to({}, {
                duration: 0.1
            })
            .to(headerWrapperElement, {
                autoAlpha: 0,
                duration: 0.1
            })
            .to({}, {
                duration: 0.7
            })
            .to(headerWrapperElement, {
                autoAlpha: 1,
                duration: 0.1
            })

    });
}

function initBlobs(container = document) {

    let footerBlobElement = container.querySelector(`._contact-blob`);
    if (footerBlobElement) {
        let footerBlobContent = footerBlobElement.querySelector(`._content`);
        let footerHoverElement = container.querySelectorAll(`._get-in-touch`);
        createBlob(footerBlobElement, footerBlobContent, footerHoverElement, 180)
    }

    let dragBlobElement = container.getElementsByClassName(`_drag-blob`)[0];
    if (dragBlobElement) {
        let dragBlobContent = dragBlobElement.getElementsByClassName(`_blob-content`)[0];
        let dragHoverElement = container.getElementsByClassName(`cs-int-drag`)[0].querySelectorAll(`._content`);
        createBlob(dragBlobElement, dragBlobContent, dragHoverElement, 128)
    }
}

function caseStudyProgressBar(container = document) {

    let currentProgressElement = container.querySelector(`.case-study-progress ._current`)

    if (!currentProgressElement) return;

    gsap.to(currentProgressElement, {
        width: `100%`,
        ease: "none",
        scrollTrigger: {
            scrub: 0.3,
        }
    });

}

function caseStudyAnimations(container = document) {

    let txtMainElements = container.querySelectorAll(".cs-txt-main-left, .cs-txt-main-right");

    if (txtMainElements) {

        Array.from(txtMainElements).forEach(txtMainElement => {
            let preHeadingParagraph = txtMainElement.querySelectorAll("._pre-heading p")[0]
            let headingParagraph = txtMainElement.querySelectorAll("._heading p")[0]

            let split = SplitText.create(headingParagraph, {
                type: "lines"
            });

            gsap.from(preHeadingParagraph, {
                x: -40,
                opacity: 0,
                duration: 0.3,

                scrollTrigger: {
                    trigger: preHeadingParagraph,
                    start: 'top 80%',
                }
            })

            gsap.from(split.lines, {
                y: 5,
                opacity: 0,
                duration: 0.3,
                stagger: 0.1,
                delay: 0.1
            })
        });
    }

    let figOneFullElements = container.querySelectorAll(".cs-fig-1-full-left, .cs-fig-1-full-right");

    if (figOneFullElements) {

        Array.from(figOneFullElements).forEach(figOneFullElement => {
            let visualElement = figOneFullElement.querySelectorAll("img, video")[0]
            let descriptionParagraphs = figOneFullElement.querySelectorAll("._description p")

            gsap.from(visualElement, {
                opacity: 0,
                scale: 1.2,
                duration: .8,
                clipPath: `polygon(0 0, 100% 0, 100% 0%, 0 0%)`,
                transformOrigin: 'top center',
                ease: 'power2.inOut',
                onComplete: () => {
                    if (visualElement.tagName == `VIDEO`) {
                        visualElement.play();
                    }
                },

                scrollTrigger: {
                    trigger: visualElement,
                    start: '20% 80%',
                }
            })

            if (!descriptionParagraphs) return;

            Array.from(descriptionParagraphs).forEach(descriptionParagraph => {
                let split = SplitText.create(descriptionParagraph, {
                    type: "lines"
                });

                gsap.from(split.lines, {
                    y: 5,
                    opacity: 0,
                    duration: 0.3,
                    stagger: 0.1,

                    scrollTrigger: {
                        trigger: descriptionParagraph,
                        start: 'top 80%',
                    }
                })
            })

        })
    }

    let figOneAsymElements = container.querySelectorAll(".cs-fig-1-asym-left, .cs-fig-1-asym-right");

    if (figOneAsymElements) {

        Array.from(figOneAsymElements).forEach(figOneAsymElement => {
            let visualElement = figOneAsymElement.querySelectorAll("img, video")[0]
            let descriptionParagraphs = figOneAsymElement.querySelectorAll("._description p")

            gsap.from(visualElement, {
                opacity: 0,
                scale: 1.2,
                duration: .8,
                clipPath: `polygon(0 0, 100% 0, 100% 0%, 0 0%)`,
                transformOrigin: 'top center',
                ease: 'power2.inOut',
                onComplete: () => {
                    if (visualElement.tagName == `VIDEO`) {
                        visualElement.play();
                    }
                },

                scrollTrigger: {
                    trigger: visualElement,
                    start: '20% 80%',
                }
            })

            if (!descriptionParagraphs) return;

            Array.from(descriptionParagraphs).forEach(descriptionParagraph => {
                let split = SplitText.create(descriptionParagraph, {
                    type: "lines"
                });

                gsap.from(split.lines, {
                    y: 5,
                    opacity: 0,
                    duration: 0.3,
                    stagger: 0.1,

                    scrollTrigger: {
                        trigger: descriptionParagraph,
                        start: 'top 80%',
                    }
                })
            })
        })
    }

    let figOneByOneElements = container.querySelectorAll(".cs-fig-1x1-left, .cs-fig-1x1-right");

    if (figOneByOneElements) {
        Array.from(figOneByOneElements).forEach(figOneByOneElement => {
            let visualElements = figOneByOneElement.querySelectorAll("img, video")
            let descriptionParagraphs = figOneByOneElement.querySelectorAll("._description p")

            Array.from(visualElements).forEach(visualElement => {
                gsap.from(visualElement, {
                    opacity: 0,
                    scale: 1.2,
                    duration: .8,
                    clipPath: `polygon(0 0, 100% 0, 100% 0%, 0 0%)`,
                    transformOrigin: 'top center',
                    ease: 'power2.inOut',
                    onComplete: () => {
                        if (visualElement.tagName == `VIDEO`) {
                            visualElement.play();
                        }
                    },

                    scrollTrigger: {
                        trigger: visualElement,
                        start: '20% 80%',
                    }
                })
            })

            if (!descriptionParagraphs) return;

            Array.from(descriptionParagraphs).forEach(descriptionParagraph => {
                let split = SplitText.create(descriptionParagraph, {
                    type: "lines"
                });

                gsap.from(split.lines, {
                    y: 5,
                    opacity: 0,
                    duration: 0.3,
                    stagger: 0.1,

                    scrollTrigger: {
                        trigger: descriptionParagraph,
                        start: 'top 80%',
                    }
                })
            })
        })
    }

    let figOneByOneAsymElements = container.querySelectorAll(".cs-fig-1x1-asym-left, .cs-fig-1x1-asym-right");

    if (figOneByOneAsymElements) {
        Array.from(figOneByOneAsymElements).forEach(figOneByOneAsymElement => {
            let visualElements = figOneByOneAsymElement.querySelectorAll("img, video")
            let descriptionParagraphs = figOneByOneAsymElement.querySelectorAll("._description p")

            Array.from(visualElements).forEach(visualElement => {
                gsap.from(visualElement, {
                    opacity: 0,
                    scale: 1.2,
                    duration: .8,
                    clipPath: `polygon(0 0, 100% 0, 100% 0%, 0 0%)`,
                    transformOrigin: 'top center',
                    ease: 'power2.inOut',
                    onComplete: () => {
                        if (visualElement.tagName == `VIDEO`) {
                            visualElement.play();
                        }
                    },
                    scrollTrigger: {
                        trigger: visualElement,
                        start: '20% 80%',
                    }
                })
            })



            if (!descriptionParagraphs) return;

            Array.from(descriptionParagraphs).forEach(descriptionParagraph => {
                let split = SplitText.create(descriptionParagraph, {
                    type: "lines"
                });

                gsap.from(split.lines, {
                    y: 5,
                    opacity: 0,
                    duration: 0.3,
                    stagger: 0.1,

                    scrollTrigger: {
                        trigger: descriptionParagraph,
                        start: 'top 80%',
                    }
                })
            })
        })
    }

    let figOneByTwoAsymElements = container.querySelectorAll(".cs-fig-1x2-asym-left, .cs-fig-1x2-asym-right");

    if (figOneByTwoAsymElements) {
        Array.from(figOneByTwoAsymElements).forEach(figOneByTwoAsymElement => {
            let visualElements = figOneByTwoAsymElement.querySelectorAll("img, video")
            let descriptionParagraphs = figOneByTwoAsymElement.querySelectorAll("._description p")

            Array.from(visualElements).forEach(visualElement => {
                gsap.from(visualElement, {
                    opacity: 0,
                    scale: 1.2,
                    duration: .8,
                    clipPath: `polygon(0 0, 100% 0, 100% 0%, 0 0%)`,
                    transformOrigin: 'top center',
                    ease: 'power2.inOut',
                    onComplete: () => {
                        if (visualElement.tagName == `VIDEO`) {
                            visualElement.play();
                        }
                    },
                    scrollTrigger: {
                        trigger: visualElement,
                        start: '20% 80%',
                    }
                })
            })



            if (!descriptionParagraphs) return;

            Array.from(descriptionParagraphs).forEach(descriptionParagraph => {
                let split = SplitText.create(descriptionParagraph, {
                    type: "lines"
                });

                gsap.from(split.lines, {
                    y: 5,
                    opacity: 0,
                    duration: 0.3,
                    stagger: 0.1,

                    scrollTrigger: {
                        trigger: descriptionParagraph,
                        start: 'top 80%',
                    }
                })
            })
        })
    }
}

function caseStudySectionCompare(container = document) {
    let compareElements = container.getElementsByClassName(`cs-int-compare`);

    if (compareElements) {

        Array.from(compareElements).forEach(compareElement => {
            let beforeImage = compareElement.getElementsByClassName(`_before`)[0]
            let dividerElement = compareElement.getElementsByClassName(`_divider`)[0]
            let pulsatingCircleElement = compareElement.getElementsByClassName(`_pulsating-circle`)[0]

            let ratio = 0.5;

            let pulseTween = null;

            function startPulse() {
                if (pulseTween == null) {
                    pulseTween = gsap.to(pulsatingCircleElement, {
                        delay: 2,
                        scale: 1.75,
                        opacity: 0,
                        duration: 1.5,
                        repeat: -1,
                        repeatDelay: 1,
                        ease: "power1.inOut"
                    });
                }
            }
            startPulse()

            function stopPulse() {
                pulseTween.revert();
                pulseTween = null;
            }

            function onDrag() {
                let width = compareElement.getBoundingClientRect().width;
                gsap.set(beforeImage, {
                    clipPath: `inset(0px ${width - draggable.x}px 0px 0px)`
                });
                ratio = draggable.x / width;

                if (pulseTween !== null) {
                    stopPulse()
                }
            }

            let draggable = new Draggable(dividerElement, {
                type: "x",
                bounds: compareElement,
                onDrag: onDrag,
                onThrowUpdate: onDrag,
                onDragEnd: startPulse,
                onThrowComplete: startPulse,
                inertia: true
            });

            function onResize() {
                let width = compareElement.getBoundingClientRect().width;
                let x = ratio * width;

                gsap.set(dividerElement, {
                    x: x
                });

                gsap.set(beforeImage, {
                    clipPath: `inset(0px ${width - x}px 0px 0px)`
                });

                draggable.update(true);
            }

            window.addEventListener("resize", onResize);
            onResize();

        });
    }
}



async function caseStudySectionDrag(container = document) {

    await sleep(500);

    let dragElements = container.querySelectorAll(`.cs-int-drag`);

    if (dragElements) {
        Array.from(dragElements).forEach(dragElement => {

            let galleryElement = dragElement.querySelector(`._gallery`);

            let drag = Draggable.create(galleryElement, {
                type: "x",
                bounds: {
                    maxX: 0,
                    minX: galleryElement.clientWidth - galleryElement.scrollWidth
                },
                edgeResistance: 0.65,
                inertia: true
            });
        })
    }
}

async function indexToProjectTransitionLeave(trigger) {
    if (!trigger.hasAttribute(`video-id`)) {
        return
    };

    isScrollProgrammatic = false;

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

    Flip.from(state, {
        duration: 0.0
    })

    await gsap.to(videoElement, {
        autoAlpha: 1,
        duration: 0.3
    });
}

function capabilitiesOverlay(container = document) {
    let tellMeMoreButtons = container.querySelectorAll(`.capabilities section ._button`)

    if (tellMeMoreButtons.length === 0) return;

    let capabilitiesOverlayElement = container.querySelector(`.capabilities-overlay`)

    let capabilitiesOverlayAppendIn = capabilitiesOverlayElement.querySelector(`.width-limiter`)
    let capabilitiesOverlayContent = capabilitiesOverlayElement.querySelector(`._content`)
    let overlayBorder;
    let lastTellMeMoreButton = null;

    let capabilitiesOverlayTitleElement = capabilitiesOverlayElement.querySelector(`._title`)
    let capabilitiesOverlayParagraphsElement = capabilitiesOverlayElement.querySelector(`._paragraphs`)

    let tellMeLessButton = capabilitiesOverlayElement.querySelector(`._button`)
    let outsideClickElement = capabilitiesOverlayElement.querySelector(`._outside-click`)

    Array.from(tellMeMoreButtons).forEach(button => {
        button.addEventListener(`click`, () => {

            lenis.stop()

            let itemContent = button.parentNode

            console.log(itemContent)

            capabilitiesOverlayTitleElement.innerHTML = itemContent.querySelector(`._overlay-content ._title`).innerHTML
            capabilitiesOverlayParagraphsElement.innerHTML = itemContent.querySelector(`._overlay-content ._paragraphs`).innerHTML


            capabilitiesOverlayContent.scrollTo(0, 0);

            let buttonContent = button.querySelector(`._content`)

            lastTellMeMoreButton = button;

            overlayBorder = button.querySelector(`._overlay-border`)
            let state = Flip.getState(overlayBorder)
            capabilitiesOverlayAppendIn.insertBefore(overlayBorder, capabilitiesOverlayContent)

            let animationTimeline = gsap.timeline()

            animationTimeline.to(capabilitiesOverlayElement, {
                    autoAlpha: 0,
                    display: `block`,
                    duration: 0
                })
                .to(capabilitiesOverlayElement, {
                    autoAlpha: 1,
                    duration: 0.2,
                })
                .to(capabilitiesOverlayContent, {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.2
                }, `<+=0.45`)
                .to(buttonContent, {
                    autoAlpha: 0
                })

            Flip.from(state, {
                duration: .6,
                ease: `power3.inOut`
            })
        })
    })

    function closeOverlay() {

        lenis.start()

        overlayBorder = capabilitiesOverlayElement.querySelector(`._overlay-border`)
        let state = Flip.getState(overlayBorder)
        lastTellMeMoreButton.appendChild(overlayBorder)

        let buttonContent = lastTellMeMoreButton.querySelector(`._content`)

        let animationTimeline = gsap.timeline()

        animationTimeline.to(capabilitiesOverlayContent, {
                autoAlpha: 0,
                duration: 0.2
            })
            .to(capabilitiesOverlayElement, {
                autoAlpha: 0,
                duration: 0.2,
            })
            .to(capabilitiesOverlayElement, {
                autoAlpha: 0,
                display: `block`,
                duration: 0
            })
            .to(buttonContent, {
                autoAlpha: 1,
                duration: 0.1
            }, `<+=0.1`)

        Flip.from(state, {
            duration: .6,
            ease: `power3.inOut`
        })
    }

    tellMeLessButton.addEventListener(`click`, () => {
        closeOverlay()
    })

    outsideClickElement.addEventListener(`click`, () => {
        closeOverlay()
    })
}

let mobileMenuOpen = false;

function headerScrollAnimation(container = document) {

    let headerWrapperElement = container.querySelector(`.header-wrapper`)

    let headerAnimation = gsap.from(headerWrapperElement, {
        yPercent: -100,
        paused: true,
        duration: 0.3
    }).progress(1);

    let lastDirection = null;

    window.addEventListener(`scroll`, () => {
        if (scrollDirection != lastDirection) {
            lastDirection = scrollDirection;

            if (scrollDirection == 1 && mobileMenuOpen == false) {
                headerAnimation.reverse()
            } else if (scrollDirection == -1) {
                headerAnimation.play()
            }
        }
    })
}

function toggleMobileMenu(container = document) {
    let mobileMenuToggleButton = container.querySelector(`.header-wrapper ._mobile-menu-toggle`)
    let mobileMenuElement = container.querySelector(`.mobile-menu`)

    let menuItems = container.querySelectorAll(`.mobile-menu li`)

    function openMenu() {
        lenis.stop()
        mobileMenuOpen = true;
        mobileMenuToggleButton.innerHTML = `CLOSE`

        gsap.to(mobileMenuElement, {
            x: `0%`,
            duration: 0.3,
            ease: `power3.out`
        })
    }

    function closeMenu() {
        lenis.start()
        mobileMenuOpen = false;
        mobileMenuToggleButton.innerHTML = `MENU`

        gsap.to(mobileMenuElement, {
            x: `100%`,
            duration: 0.3,
            ease: `power3.out`
        })
    }

    mobileMenuToggleButton.addEventListener(`click`, () => {

        if (mobileMenuOpen == false) {
            openMenu()

        } else if (mobileMenuOpen == true) {
            closeMenu()
        }
    })

    window.addEventListener(`switchedToDesktop`, () => {
        console.log()
        closeMenu()
    })

    Array.from(menuItems).forEach(menuItem => {
        menuItem.addEventListener(`click`, () => {
            lenis.start()
        })
    })
}

async function indexToProjectTransitionEnter(container = document) {

    let transitionWrapper = document.getElementsByClassName(`video-transition-wrapper`)[0];

    let nextProjectWrapperElement = container.querySelector(`.next-project-wrapper`)

    if (!transitionWrapper || !transitionWrapper.hasChildNodes()) {

        lenis.scrollTo(100, {
            immediate: true,
            onComplete: () => {
                lenis.scrollTo(0, {

                })
            }
        })

        gsap.to(nextProjectWrapperElement, {
            autoAlpha: 1,
            duration: 0
        })



        return;
    }

    let videoFromTransition = transitionWrapper.getElementsByTagName(`video`)[0];
    let projectHero = document.getElementsByClassName(`project-hero`)[0]
    let videoWrapper = projectHero.getElementsByClassName(`_video-wrapper`)[0]
    let inPageVideo = videoWrapper.getElementsByTagName(`video`)[0]
    let projectTitle = projectHero.getElementsByClassName(`_title`)[0]
    let projectMetaWrappers = projectHero.getElementsByClassName(`_meta-wrapper`)

    inPageVideo.remove();
    await sleep(500)

    gsap.to(videoFromTransition, {
        autoAlpha: 1,
        duration: 0
    });

    gsap.to(projectTitle, {
        autoAlpha: 0,
        duration: 0
    })

    gsap.to(Array.from(projectMetaWrappers), {
        autoAlpha: 0,
        duration: 0
    })

    await sleep(500);

    lenis.scrollTo(0, {
        duration: 0.8,
        easing: t => Math.sin((t * Math.PI) / 2),
        onComplete: () => {

        }
    })

    videoFromTransition.parentNode.insertBefore(videoWrapper, videoFromTransition);
    videoWrapper.appendChild(videoFromTransition)

    let state = Flip.getState(videoWrapper)

    projectHero.appendChild(videoWrapper)

    gsap.to(transitionWrapper, {
        autoAlpha: 0,
        duration: 0
    })

    gsap.fromTo(projectTitle, {
        y: 24
    }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.3,
        delay: 0.8
    })

    gsap.fromTo(Array.from(projectMetaWrappers), {
        y: 24
    }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.3,
        stagger: 0.1,
        delay: 0.9
    })

    await Flip.from(state, {
        duration: 1,
        ease: "power2.inOut"
    })

    gsap.to(nextProjectWrapperElement, {
        autoAlpha: 1,
        duration: 0.3
    })

}

barba.init({
    transitions: [{
        name: 'projectTransition',
        async leave(data) {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());

            const triggeredElement = data.trigger;
            if (triggeredElement) {
                await indexToProjectTransitionLeave(triggeredElement);
            }
        }
    }],
    views: [{
            namespace: 'home',
            async afterEnter(data) {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());

                headerScrollAnimation(data.next.container)
                toggleMobileMenu(data.next.container)
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

                isScrollProgrammatic = true;

                lenis.scrollTo(0, {
                    immediate: true,
                    onComplete: () => {
                        isScrollProgrammatic = false;
                    }
                })
            }
        },
        {
            namespace: 'project',
            afterEnter(data) {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());

                headerScrollAnimation(data.next.container);
                toggleMobileMenu(data.next.container)
                indexToProjectTransitionEnter(data.next.container);
                initBlobs(data.next.container);

                caseStudyAnimations(data.next.container);
                caseStudySectionCompare(data.next.container);
                caseStudySectionDrag(data.next.container);
                caseStudyProgressBar(data.next.container)

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        ScrollTrigger.refresh();
                    });
                });
            }
        },
        {
            namespace: `capabilities`,
            async afterEnter(data) {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());

                headerScrollAnimation(data.next.container)
                toggleMobileMenu(data.next.container)
                initBlobs(data.next.container);
                capabilitiesOverlay(data.next.container)

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        ScrollTrigger.refresh();
                    });
                });

                await sleep(500)

                isScrollProgrammatic = true;

                lenis.scrollTo(0, {
                    immediate: true,
                    onComplete: () => {
                        isScrollProgrammatic = false;
                    }
                })
            }
        }
    ]
});