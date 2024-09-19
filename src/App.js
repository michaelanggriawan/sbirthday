import React, { useState } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
import image1 from './images/1.jpeg';
import image2 from './images/2.jpeg';
import image3 from './images/3.jpeg';
import image4 from './images/4.jpg';
import image5 from './images/5.jpg';
import image6 from './images/6.jpg';

import styles from './style.module.css';

// Array of cards (images)
const cards = [
  image6,
  image5,
  image4,
  image3,
  image2,
  image1,
];

// Array of romantic and spiritual birthday messages
const texts = [
  "Happy 9th Spiritual Birthday! Watching you grow in your faith has been such a blessing, and every day I admire not only your heart for God but also how you inspire me to be better. You're truly amazing.",
  "It's been 9 years since your baptism, and in that time, you've only become more incredible, both in your faith and in the way you carry yourself. You have a light that brightens my world, and I'm so grateful to know you.",
  "9 years ago, you took a step of faith, and ever since, your journey has been so inspiring. I can't help but feel something deeper every time I'm around you—your joy, your faith, and your presence just mean so much to me.",
  "As you celebrate your 9th spiritual birthday, I can't help but think how lucky I am to witness your walk with God. You're not just special because of your faith, but because of the way you make everyone around you, including me, feel loved and appreciated.",
  "9 years of walking with God, and I hope you know how proud I am of you. You have a way of making everything brighter, and my heart is filled with admiration for you—not just for your faith but for who you are.",
  "On this special day, I want you to know that you're always on my mind. Your spiritual journey is so beautiful, but so is everything else about you. I'm lucky to have you in my life, and I hope you can feel how much you mean to me."
];

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});
const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

function Deck() {
  const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out
  const [currentTextIndex, setCurrentTextIndex] = useState(0); // State to hold the current text index
  const [props, api] = useSprings(cards.length, (i) => ({
    ...to(i),
    from: from(i),
  })); // Create a bunch of springs using the helpers above

  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(
    ({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
      const trigger = velocity > 0.2; // If you flick hard enough it should trigger the card to fly out
      const dir = xDir < 0 ? -1 : 1; // Direction should either point left or right
      if (!down && trigger) gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      api.start((i) => {
        if (index !== i) return; // We're only interested in changing spring-data for the current spring
        const isGone = gone.has(index);
        const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
        const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0); // How much the card tilts, flicking it harder makes it rotate faster
        const scale = down ? 1.1 : 1; // Active cards lift up a bit
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      });

      // Update text index when the drag is completed (finger is released)
      if (!down) {
        setCurrentTextIndex(index);
      }

      if (!down && gone.size === cards.length)
        setTimeout(() => {
          gone.clear();
          api.start((i) => to(i));
        }, 600);
    }
  );
  console.log('currentTextIndex',currentTextIndex)
  return (
    <>
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div className={styles.deck} key={i} style={{ x, y }}>
          {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
          <animated.div
            {...bind(i)}
            style={{
              transform: interpolate([rot, scale], trans),
              backgroundImage: `url(${cards[i]})`,
            }}
          />
        </animated.div>
      ))}
      {/* Display text under the cards */}
      <div className={styles.textContainer}>
        <h2 className={styles.cardText}>{texts[currentTextIndex]}</h2>
      </div>
    </>
  );
}

export default function App() {
  return (
    <div className={styles.container}>
      <Deck />
    </div>
  );
}
