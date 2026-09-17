import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PixelHeart from '../components/PixelHeart';
import PixelSprite from '../components/PixelSprite';
import { MOON_GRID, PINE_GRID } from '../pixelGrids';
import ChapterDetailScreen from './ChapterDetailScreen';
import image1 from '../assets/Image1.png';
import image2 from '../assets/Image2.png';
import image3 from '../assets/Image3.png';

const CHAPTERS = [
  {
    id: 'one',
    label: 'Chapter One',
    title: 'Who Are You?',
    color: 'var(--pink)',
    image: image1,
    paragraphs: [
      `In the early days of the world called Zelvaria, there was a boy who thought being alone was happiness. He had no idea that was about to change.`,
      `One day, a new player joined. Mingming, who would later go by Charmy, was one of the first few to arrive in the world. The boy noticed her right away, though at the time he was a bit of a "kupal" about it. As far as he knew, she was just another player, someone he'd greet once and never think about again.`,
      `He saw her in a few calls but didn't say anything, until one day he finally greeted her: "Hello Charmy!" He wasn't expecting the "Hello Vinnie!" that came back. Vinnie always had a knack for reading a person's vibe, and her kindness hit him like a truck through a wall. He was intrigued now. He kept watching her, kept visiting her settlement, which she'd named "Arasaka!?" "That's from Cyberpunk!" he said. It was one of his favorite games.`,
      `After that, he found himself checking in on her every time she was online. He'd quietly leave gold coins for her, slip resources into her storage chest, never letting her know it was him. He kept it up until a friend came to visit his hometown, and he disappeared from the game for a few weeks. It seemed like that was the end of it. He was wrong.`,
    ],
  },
  {
    id: 'two',
    label: 'Chapter Two',
    title: 'Opening Doors',
    color: 'var(--sky)',
    image: image2,
    paragraphs: [
      `It seemed like that was the end of it, until his friend came to visit and they got to talking. His friend mentioned, "Oo nga pala, kilala mo si Charmy? Natatanong ka rin pala niya sa akin minsan." He was floored. He'd never let on that he'd been doing all that for her, yet somehow she'd been asking about him. Then his friend added, "Tinanong niya rin kung anong klaseng babae gusto mo." What? Why would she even say that? Was she curious about him?`,
      `Weeks went by without either of them reaching out. Then, on July 4th, she messaged him out of nowhere. They talked about nothing in particular and then went quiet again. He figured that was that, just another dead end. Around this time he was going through his own crisis, wondering if people only valued his kindness for what they could get out of him. So he shut everyone out.`,
      `Then on July 15th, she wrote, "Hi Vinnie, I need you asap." His kind heart didn't know what to do with that. In a panic, he replied, "Okay, give me 5 minutes," and then left her on read. He genuinely didn't want to talk to anyone. But she didn't give up. The next day she asked again if he could help her, and he did, though he held back. Then she asked, "Mag web dev ka pa rin sa Zelvaria?" And that's how it started.`,
    ],
  },
  {
    id: 'three',
    label: 'Chapter Three',
    title: 'Building Together',
    color: 'var(--purple)',
    image: image3,
    paragraphs: [
      `That was when he asked himself, "Do I actually help them, or do I protect my peace?" Hesitant, he said, "Pwede pa rin akong mag-dev," though he wasn't ready to hand over the files he'd built out of his own kindness. "Pero kailangan mo akong sagutin every time magtatanong ako," she said, and that was easy enough to agree to. "Wala ka sa Discord," she pointed out. "Nakakahiya sa owner eh," he admitted. "Ako na ang owner, wag ka mahiya," she said. Something about that touched him deeply. Even after his hesitation, she was still kind. She was the echo of his own kindness, reflected back at him.`,
      `From there, things picked up. They talked constantly, and he realized just how much she'd been struggling on her own. This time he gave her his full effort, on one condition: he'd only work with her, no one else. They spent hours talking through the server, fixing whatever needed fixing. Sleepless nights, endless bugs, and somehow it all felt cozy.`,
      `It wasn't long before the conversations turned personal, interests, hobbies, getting to know each other. They found they had a lot in common, both drawn to the same things, both a little fascinated by the same ideas. Eventually they started a project together called Project-Eden, both of them hooked on sci-fi. That's when they realized they liked a lot of the same games too. She asked if he'd ever played Split Fiction. He hadn't, he never had anyone to play it with. So he asked if she'd play it with him, half expecting a no. She said yes. And that's where it all really began.`,
    ],
  },
  {
    id: 'four',
    label: 'Chapter Four',
    title: 'A Single Game',
    color: 'var(--green)',
    paragraphs: [
      `It started with a single game. The first time he played Split Fiction, he was in awe, and she talked him through it, the story, the characters, the whole premise, while he listened closely. The real difficulty wasn't the game. It was their schedules. She was always busy, and he waited, so patiently that he started feeling sad on the days they couldn't play. When they finally could, he was so happy he couldn't tell if it was the game making him happy, or her. He didn't know it yet, but it was her.`,
      `They played through it together, laughed through the hard parts and the easy ones, and were happy just being in it. They'd save at whatever point felt right when they were tired, but it never felt like enough. Then came her week-long vacation. He was sad he'd have to wait, but he knew she'd come back to play with him again. All through her trip they kept talking, simple hellos, good mornings, good nights, until one day out of nowhere she started sending him updates. Pictures of where she was, the food she was eating, even a video of something she knew he liked. He was stunned. "But why?" he thought. Why would she share all of this with him?`,
      `He didn't know what to feel. Not nothing, definitely not nothing, he felt everything at once: hurt, yearning, happiness, all tangled together. There were feelings involved now, that much was clear. "Maybe she has feelings for me?" he asked himself, and couldn't answer. He was good at reading people, at sensing what they felt before they said it, but with her he had no idea. Something in him had woken up, something he'd kept locked away for a long time, and even he didn't know where it came from. "Eto nanaman ba?" he thought. Another risk. Another disaster waiting to happen.`,
    ],
  },
  {
    id: 'five',
    label: 'Chapter Five',
    title: 'The Spiral',
    color: 'var(--yellow)',
    paragraphs: [
      `He didn't know what to do with what he was feeling, whether to protect his peace or risk it all for this girl. Confused, they kept playing like always, grinding Palworld, building the base, exploring together, and for a while the games were just an excuse to spend time with her, or so he told himself. "Miss ko si charm," he caught himself thinking, and he couldn't tell if it was her he missed or just the routine of playing together. He didn't dwell on it. He went to the gym and moved on. But they were getting closer. She was becoming something to him. He was falling.`,
      `Then came It Takes Two. She told him how much the game meant to her, how she wished her own life could work out the way the story did. He felt how uneasy she was underneath it, felt it fully, and he told himself, "I'll stay with this girl, she needs it." His kindness again. He'd promised himself he wouldn't let himself be this open again, but there was something about her he couldn't resist, so he risked it, again, for her. She had no idea this boy was going to stay for good.`,
      `They took pictures together and played for days straight. Hearing her laugh, hearing her happy, was enough to make him feel like he was keeping his word to her. They were happy, and busy, as their server Zelvaria got ready to open. She kept working on her models, he kept fixing whatever needed fixing, and they talked about more than just games now. Then things went sideways. Someone new joined the server, a girl who went by Frosty, just passing through. Everyone knew her as a little devious, but Vinnie was the one person she actually talked to, since they had things in common. That shared interest was where it all started to spiral.`,
      `Frosty and Vinnie talked about cybersecurity, about keeping everyone safe after some recent attacks and a "kupal" who'd slipped into the server and left. He wanted to learn what she knew, partly for his own reasons: protecting everyone, especially now that he had feelings for Charmy. At one point Frosty and Vinnie got on a call to go over the defenses they were building, kept quiet since exposing it could put everyone at risk, and he felt like he was the only one who could carry that responsibility. Then Charmy joined the call and asked if it was only the two of them. "Yes, kasi it's confidential," he said, and she left. He knew something was wrong, even if he didn't fully understand what she was feeling. The real fallout started the next day.`,
    ],
  },
  {
    id: 'six',
    label: 'Chapter Six',
    title: 'The Night He Fell',
    color: 'var(--teal)',
    paragraphs: [
      `The day after, Charmy was different with him. He knew the signs, she was tampo, still upset about what happened. So he persisted, calling her, wanting to spend time with her, what he called "Charmy time." She didn't feel like talking at first, but he kept at it, gently, until she opened up again and was herself. He stayed on the call with her until dawn, until she fell asleep, just so he'd know she was okay.`,
      `Then they played Sea of Thieves together, and it was genuinely fun, the kind of fun that made the exhaustion from their own busy days just disappear when they were together. It only deepened how much he wanted to be near her, even if it was just a voice on a call. Hearing her made everything else stop mattering. It scared him a little, how fast he was falling. A fall like that doesn't end softly.`,
      `September 1st, his birthday, usually just another day to him. Then "Mein Schatz," Charmy, greeted him, and he was ecstatic, until he noticed something was off. She felt sad, though she kept telling him, "Don't mind me, it's your day." She didn't know that being with her already was his day. He waited for her to come home from her busy Monday, and when she finally did, she wasn't in the mood to call. He waited anyway, sensing something wrong. The hardest part was working up the nerve to ask her. "What if she doesn't want to?" "May nagawa nanaman ba ako?" "Did I make her sad?" "Kailangan bumawi for her." "I must make her happy." When they finally called, she was so quiet she'd muted herself, but he stayed anyway. Lord, I love this girl, he thought, please help me make her happy. They talked, they sat with it, she kept apologizing for nothing that mattered to him. She mattered more.`,
      `Then they watched Project Hail Mary together. At first her silence scared him, he felt himself growing uneasy too, but he held his ground. I love this girl, he told himself. Then she unmuted, and slowly she came back, a little talkative, a little more herself, until she finally laughed. He didn't tell her, but seeing her happy again made him happier than she could have known. He stayed with her until she fell asleep, and for the first time in a while, he felt at peace. That was the night he fell completely. Vinnie loved Charmy. He wanted to protect her, wanted her happy, wanted her, and neither of them knew yet what came next.`,
    ],
  },
];

export default function StoryScreen({ onBack, onNavigate }) {
  const [activeChapter, setActiveChapter] = useState('one');
  const [openChapter, setOpenChapter] = useState(null);
  const chapterRefs = useRef({});
  const scrollRef = useRef(null);

  const goTo = (step) => {
    if (onNavigate) onNavigate(step);
    else onBack();
  };

  const scrollToChapter = (id) => {
    setActiveChapter(id);
    chapterRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="story-page-screen" ref={scrollRef}>
      <div className="story-bg" aria-hidden="true">
        <div className="story-bg-stars">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className="story-star"
              style={{
                left: `${(i * 23) % 100}%`,
                top: `${(i * 31) % 95}%`,
                animationDelay: `${(i % 6) * 0.4}s`,
              }}
            />
          ))}
        </div>
        <PixelSprite grid={MOON_GRID} size={72} color="#fff3c4" className="story-bg-moon" />
        <div className="story-bg-tree left">
          <PixelSprite grid={PINE_GRID} size={80} color="#173622" />
        </div>
        <div className="story-bg-tree right">
          <PixelSprite grid={PINE_GRID} size={80} color="#173622" />
        </div>
      </div>

      <div className="story-content">
        <nav className="story-nav">
          <p className="story-nav-tagline">
            Same game.
            <br />
            Different stories.
            <br />
            Now ours.
          </p>
          <div className="story-nav-links">
            <button type="button" className="story-nav-link" onClick={() => goTo('menu')}>
              Home
            </button>
            <button
              type="button"
              className="story-nav-link active"
              onClick={() => setOpenChapter(null)}
            >
              Our Story
            </button>
            <button type="button" className="story-nav-link" onClick={() => goTo('photos')}>
              Gallery
            </button>
          </div>
        </nav>

        {openChapter ? (
          <ChapterDetailScreen chapter={openChapter} onBack={() => setOpenChapter(null)} />
        ) : (
          <>
            <header className="story-header">
              <PixelHeart size={26} color="#ff6b9d" className="pixel-beat" />
              <h1 className="story-title">Our Story</h1>
              <p className="story-subtitle">A Story of Mein Schatz</p>
              <p className="story-tagline">Different worlds. Same stars.</p>
            </header>

            <div className="story-tabs">
              {CHAPTERS.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  className={`story-tab${activeChapter === chapter.id ? ' active' : ''}`}
                  onClick={() => scrollToChapter(chapter.id)}
                >
                  {chapter.label}
                </button>
              ))}
            </div>

            {CHAPTERS.map((chapter, index) => (
              <motion.section
                key={chapter.id}
                ref={(el) => (chapterRefs.current[chapter.id] = el)}
                className="story-chapter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <span className="story-chapter-tag" style={{ '--tag-color': chapter.color }}>
                  {chapter.label}
                </span>
                <h2 className="story-chapter-title">{chapter.title}</h2>
                <p className="story-chapter-body">{chapter.paragraphs[0]}</p>
                <button
                  type="button"
                  className="story-read-more"
                  onClick={() => setOpenChapter(chapter)}
                >
                  Read More <span aria-hidden="true">&rarr;</span>
                </button>
              </motion.section>
            ))}

            <footer className="story-footer">
              <PixelHeart size={16} color="#ff6b9d" />
              <p>Here&apos;s to more chapters Mein Schatz.</p>
            </footer>
          </>
        )}
      </div>

      <p className="story-corner-note">A story that keeps loading... &hearts;</p>
    </div>
  );
}
