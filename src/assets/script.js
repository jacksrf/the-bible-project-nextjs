gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

window.addEventListener("DOMContentLoaded", () => {
  /* LENIS SMOOTH SCROLL (OPTIONAL) */
  lenis = new Lenis({
    autoRaf: true,
  })
  /* LIENIS SMOOTH SCROLL (OPTIONAL) */

  /* Only on large devices */
  const mm = gsap.matchMedia()
  mm.add("(min-width: 769px)", () => {
    const projects = document.querySelectorAll(".mwg_effect038 .project")
    projects[0].classList.add("on")
    const numProjects = projects.length
    let currentProject = projects[0]

    const container = document.querySelector(".mwg_effect038 .container")
    const dist = container.clientWidth - document.body.clientWidth
    const projectWidth = container.clientWidth / numProjects
    const section = document.querySelector(".mwg_effect038")
    const sectionTop = section.offsetTop
    const pinHeight = $(".container").height() * 2
    console.log(pinHeight)
    // Add click handlers to projects
    projects.forEach((project, index) => {
      const label = project.querySelector("p.label")
      label.addEventListener("click", () => {
        // Calculate the scroll position for this project
        console.log("Project index:", index)
        console.log($(window).height() + $(".project.on .media").width())
        const scrollProgress = pinHeight / numProjects
        console.log("Scroll progress:", scrollProgress)
        const scrollPosition = scrollProgress * index + scrollProgress / 2
        console.log("Scroll to position:", scrollPosition)
        var duration
        const currentScroll = window.scrollY
        const currentProgress = currentScroll / pinHeight
        const currentClosestIndex = Math.round(currentProgress * (numProjects - 1))

        if (currentClosestIndex > index) {
          duration = (2 / numProjects) * (currentClosestIndex - index)
          console.log("Duration:", duration)
        } else {
          duration = (2 / numProjects) * (index - currentClosestIndex)
          console.log("Duration:", duration)
        }
        // Smooth scroll to the project position
        gsap.to(window, {
          duration: duration,
          scrollTo: {
            y: scrollPosition,
            autoKill: false,
          },
          ease: "none",
        })
      })
    })

    gsap.to(container, {
      x: -dist,
      ease: "none",
      scrollTrigger: {
        trigger: ".mwg_effect038 .pin-height",
        pin: container,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const closestIndex = Math.round(self.progress * (numProjects - 1))
          const closestProject = projects[closestIndex]

          if (closestProject !== currentProject) {
            currentProject.classList.remove("on")
            closestProject.classList.add("on")
            currentProject = closestProject
            console.log(window)
            console.log("Current scroll progress:", self.progress)
            console.log("Current scroll position:", window.scrollY)
          }
        },
      },
    })
  })
})
