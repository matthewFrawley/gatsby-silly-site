import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { gsap } from "gsap"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { graphql, PageProps } from "gatsby"
import { Transition } from "react-transition-group"
import Img from "gatsby-image"
import SEO from "../components/seo"
import { lockScroll, unlockScroll } from "../utils/helpers"
import downIcon from "../icons/down.png"
import "./index.scss"

if (typeof window !== `undefined`) {
  gsap.registerPlugin(ScrollTrigger)
  gsap.registerPlugin(SplitText)
  gsap.defaults({ overwrite: "auto", duration: 0.3 })
}

const IndexPage: React.FC<PageProps> = ({ data }) => {
  const [disableMotion, setDiableMotion] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const about = useRef(null)
  const aboutBackground = useRef(null)

  // Handle motion toggle - either by button press or media query change
  useLayoutEffect(() => {
    if (disableMotion) {
      setupWithoutAnimations()
    } else {
      setupWithAnimations()
    }
    window.scrollTo(0, 0)
  }, [disableMotion])

  useEffect(() => {
    // Grab the prefers reduced media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    // Check if the media query matches or is not available.
    if (!mediaQuery || mediaQuery.matches) {
      console.log("User prefers reduced motion")
      setDiableMotion(true)
    } else {
      console.log("User has no motion preference")
    }

    // Adds an event listener to check for changes in the media query's value.
    mediaQuery.addEventListener("change", () => {
      if (mediaQuery.matches) {
        setDiableMotion(true)
      } else {
        setDiableMotion(false)
      }
    })
  }, [])

  /**
   * Static Setup
   */
  const setupWithoutAnimations = useCallback(() => {
    // Clear any scroll triggers
    // ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    // Update the height of the body and main
    gsap.set("#main", { height: "fit-content", position: "relative" })
    gsap.set("body", { height: "fit-content" })
    setupBackground(false)
  }, [])

  /**
   * Animation Setup
   */
  const currentParagraph = useRef<HTMLDivElement>()

  const setActiveParagraph = useCallback((newParagraph: HTMLDivElement) => {
    const transitionIn = (paragraph: HTMLDivElement) => {
      // Sets the text container back on the z axis
      gsap.set(paragraph, {
        z: -1000,
        autoAlpha: 0, //Hidden in CSS for initial mount
      })
      const sentences: HTMLParagraphElement[] = gsap.utils.toArray(
        paragraph.querySelectorAll("p")
      )
      const sentenceSplits: SplitText[] = sentences.map(
        (sentence: HTMLParagraphElement) => new SplitText(sentence)
      )
      const timeline = gsap.timeline({ paused: true })
      // Schedule the sentences appearing
      sentenceSplits.forEach((splitSentence, i) => {
        // gsap.set(split.chars, { y: "random(80,-80)", autoAlpha: 0 })
        timeline.fromTo(
          splitSentence.chars,
          {
            y: "random(72,-72)",
            opacity: 0,
          },
          {
            y: 0,
            delay: i,
            stagger: { from: "random", amount: 0.4 },
            duration: 0.8,
            opacity: 1,
            ease: "ease-in",
          },
          0
        )
      })
      // Get the container to appear
      timeline.to(
        paragraph,
        { z: 0, autoAlpha: 1, duration: sentenceSplits.length },
        0
      )
      timeline.call(() => timeline.kill())
      // Run the animation
      timeline.play()
    }

    const transitionOut = (oldParagraph: HTMLDivElement) => {
      gsap.to(oldParagraph, { z: 200, autoAlpha: 0, duration: 1 })
    }

    if (newParagraph !== currentParagraph.current) {
      transitionOut(currentParagraph.current)
      transitionIn(newParagraph)
      currentParagraph.current = newParagraph
    }
  }, [])

  const setupWithAnimations = useCallback(() => {
    transitionTitleIn()

    // Clear any scroll triggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())

    const paragraphs: HTMLDivElement[] = gsap.utils.toArray(".paragraph-motion")

    gsap.set("main", { height: "100vh", position: "fixed" })
    // Sets the body height based on the number of paragraphs (for the scrolling)
    gsap.set("body", { height: `${paragraphs.length * 100}vh` })

    // create a ScrollTrigger for each paragraph section
    paragraphs.forEach((div, i) => {
      ScrollTrigger.create({
        // use dynamic scroll positions based on the window height (offset by half to make it feel natural)
        start: () => (i - 0.5) * innerHeight,
        end: () => (i + 0.5) * innerHeight,
        // when a new section activates (from either direction), set the section.
        onToggle: self => self.isActive && setActiveParagraph(div),
      })
    })

    setupBackground(true)
  }, [])

  const setupBackground = (shouldMotion: boolean) => {
    // Background image
    gsap.set(".bg-img", { scale: shouldMotion ? 5 : 1, opacity: 0.05 })
    gsap.to(".bg-img", {
      id: "bg",
      scale: 1,
      opacity: 0.35,
      scrollTrigger: {
        trigger: "body",
        scrub: 1,
        start: "top top",
        end: "bottom bottom",
      },
    })
  }

  const transitionTitleIn = () => {
    // Title transition in
    const headingSplit = new SplitText(".title-motion")
    gsap.set(headingSplit.chars, { y: "random(160,-160,5)", opacity: 0 })
    gsap.set(".title-motion", { opacity: 1 })
    gsap.to(headingSplit.chars, {
      y: 0,
      opacity: 1,
      delay: 0.6,
      stagger: { from: "random", amount: 1.2 },
      duration: 2,
      onComplete: () => {
        const scrollDownElement = document.querySelector(".scroll-down")
        scrollDownElement && scrollDownElement.classList.add("scroll-down-show")
      },
    })
  }

  const onAboutPress = useCallback(() => {
    setShowAbout(prev => !prev)
  }, [showAbout])

  const onAboutEnter = useCallback(() => {
    gsap.set(aboutBackground.current, { opacity: 0 })
    if (disableMotion) {
      gsap.set(about.current, { opacity: 0 })
    } else {
      gsap.set(about.current, { xPercent: -100 })
    }
    lockScroll()
  }, [disableMotion])

  const onAboutEntering = useCallback(() => {
    gsap.to(aboutBackground.current, { opacity: 1, duration: 0.4 })
    const params = disableMotion
      ? { opacity: 1, duration: 0.4 }
      : { xPercent: 0, duration: 0.4 }
    gsap.to(about.current, params)
  }, [disableMotion])

  const onAboutExiting = useCallback(() => {
    gsap.to(aboutBackground.current, { opacity: 0, duration: 0.3 })
    const params = disableMotion
      ? { opacity: 0, duration: 0.3 }
      : { xPercent: -100, duration: 0.3 }
    gsap.to(about.current, params)
    unlockScroll()
  }, [disableMotion])

  return (
    <>
      <SEO title="The Jabberwocky Poem" />
      {/* Main Poem */}
      <main id="main">
        {/* Nav Bar */}
        <nav>
          <button id="button-about" onClick={onAboutPress}>
            About
          </button>
          {/* Motion Toggle */}
          <button
            onClick={() => setDiableMotion(prev => !prev)}
            id="button-motion"
          >
            {disableMotion ? "Enable" : "Disable"} Motion
          </button>
        </nav>
        <Img
          fluid={data.bg.childImageSharp.fluid}
          className="bg-img"
          alt="Jabberwocky"
          imgStyle={{ objectFit: "cover" }}
          loading="eager"
        />

        {/* Animated */}
        {!disableMotion && (
          <section className="text-container-motion">
            {/* Title */}
            <div className="text title paragraph-motion">
              <h1 className="title-motion">Jabberwocky</h1>
              <h2 className="title-motion">
                from Through the Looking-Glass, and What Alice Found There
                (1871)
              </h2>
              <div className="scroll-down">
                <img src={downIcon} alt="down" />
              </div>
            </div>
            {/* Paragraphs */}
            {POEM.map((paragraph: string[], i: number) => (
              <div key={`paragraph-${i}`} className="text paragraph-motion">
                {paragraph.map((sentence, index) => (
                  <p key={`${sentence[0]}-${index}`}>{sentence}</p>
                ))}
              </div>
            ))}
          </section>
        )}
        {/* // Static */}
        {disableMotion && (
          <section className="text-container">
            <div className="text title">
              <h1>Jabberwocky</h1>
              <h2>
                from Through the Looking-Glass, and What Alice Found There
                (1871)
              </h2>
            </div>
            {POEM.map((paragraph: string[], i: number) => (
              <div key={i} className="text">
                {paragraph.map((sentence, index) => (
                  <p key={`${sentence[0]}-${index}`}>{sentence}</p>
                ))}
              </div>
            ))}
          </section>
        )}
      </main>

      {/* About */}
      <Transition
        in={showAbout}
        timeout={400}
        mountOnEnter={true}
        unmountOnExit={true}
        onEnter={onAboutEnter}
        onEntering={onAboutEntering}
        onExiting={onAboutExiting}
      >
        <div id="about">
          {/* Backdrop */}
          <div ref={aboutBackground} onClick={() => setShowAbout(false)} />
          {/* Menu */}
          <div id="about-content" ref={about}>
            <Img
              fixed={data.author.childImageSharp.fixed}
              alt="Lewis Carroll"
              loading="lazy"
              imgStyle={{ objectFit: "cover" }}
            />
            <div>
              <span>'Jabberwocky' Poem by</span>
              <a
                title="Lewis Carroll on Wikipedia"
                href="https://en.wikipedia.org/wiki/Lewis_Carroll"
                rel="noreferrer"
                target="_blank"
              >
                <h2>Lewis Carroll</h2>
              </a>
              <span>
                English writer of children's fiction.
                <br />
                The poems Jabberwocky and The Hunting of the Snark are
                classified in the genre of literary nonsense.
              </span>
            </div>

            <a href="https://loopspeed.co.uk/" target="_blank" rel="noreferrer">
              <h4>Silly site by Matthew Frawley</h4>
            </a>
          </div>
        </div>
      </Transition>
    </>
  )
}

export default IndexPage

export const query = graphql`
  query HomePageQuery {
    bg: file(relativePath: { eq: "bg.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 1600) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    author: file(relativePath: { eq: "portrait.jpg" }) {
      childImageSharp {
        fixed(width: 296, height: 296) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`

const POEM: string[][] = [
  [
    "'Twas brillig, and the slithy toves",
    "Did gyre and gimble in the wabe;",
    "All mimsy were the borogoves,",
    "And the mome raths outgrabe.",
  ],
  // ---
  [
    '"Beware the Jabberwock, my son!',
    "The jaws that bite, the claws that catch!",
    "Beware the Jubjub bird, and shun",
    'The frumious Bandersnatch!"',
  ],
  // --
  [
    "He took his vorpal sword in hand:",
    "Long time the manxome foe he sought—",
    "So rested he by the Tumtum tree,",
    "And stood awhile in thought.",
  ],
  // --
  [
    "And as in uffish thought he stood",
    "The Jabberwock, with eyes of flame,",
    "Came whiffling through the tulgey wood,",
    "And burbled as it came!",
  ],
  // --
  [
    "One, two! One, two! And through and through",
    "The vorpal blade went snicker-snack!",
    "He left it dead, and with its head",
    "He went galumphing back.",
  ],
  // --
  [
    '"And hast thou slain the Jabberwock?',
    "Come to my arms, my beamish boy!",
    'O frabjous day! Callooh! Callay!"',
    "He chortled in his joy.",
  ],
  // --
  [
    "'Twas brillig, and the slithy toves",
    "Did gyre and gimble in the wabe;",
    "All mimsy were the borogoves,",
    "And the mome raths outgrabe.",
  ],
]

// from Through the Looking-Glass, and
// What Alice Found There (1871)

// {/* <footer>
//   <p>
//     Poem by Lewis Carroll from 'Through the Looking-Glass, and What Alice
//     Found There' (1871)
//     <br />
//     <span style={{ fontSize: "1rem", textAlign: "center" }}>
//       Website by Matthew Frawley for the Gatsby Silly Site Competition
//       December 2020
//     </span>
//   </p>
//   © {new Date().getFullYear()}, Built with
//   {` `}
//   <a href="https://www.gatsbyjs.com">Gatsby</a>
// </footer> */}

// {
//   /* <a href="https://iconscout.com/icons/direction-arrow" target="_blank">Direction Arrow Icon</a> by <a href="https://iconscout.com/contributors/hana-arif">Vectors Point</a> on <a href="https://iconscout.com">Iconscout</a> */
// }

// {
//   /* <div className="image">
//               <img src="https://upload.wikimedia.org/wikipedia/commons/f/fb/LewisCarrollSelfPhoto.jpg" />
//             </div> */
// }

// {
//   /* <h3>
//             from Through the Looking-Glass, and What Alice Found There (1871)
//           </h3> */
// }
