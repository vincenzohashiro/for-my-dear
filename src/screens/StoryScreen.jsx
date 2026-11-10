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
  {
    id: 'seven',
    label: 'Chapter Seven',
    title: 'The Moment',
    color: 'var(--pink)',
    paragraphs: [
      `After that night, things changed between them. Maybe it was what people call "love," and they were starting to feel it. The very next day, they looked for each other. Simple greetings turned into asking when they'd play together again, and asking for each other's time became something they both looked forward to.`,
      `Simple conversations about helping with the server became talks about whether the other needed rest, out of worry about overworking and burning out. They kept tabs on each other, taking care of one another while still juggling their own busy lives. She even went so far as to protect him when he wasn't around to speak for himself. They had each other's back.`,
      `Then came his airsoft game. He was out the entire day, and it was her rest day. Even outside, he couldn't stop thinking about her, not even in the middle of the game. Whenever he had a free moment, he called her, and she waited for him to come home. By the end of the day, they were together again.`,
      `In the days that followed, their bond grew deeper, and he finally told her that he missed her. They kept working together, now as partners, calling each other "mein Schatz," and eventually, he started calling her "baby." Little updates became part of their days: before school, what the plans were, what they were about to do. Those small updates turned into constant, comfortable communication. They had grown closer than friends. It was love.`,
      `Then he made her a website, "for-my-dear." He wanted to appreciate her love and show her how much he loved her, so she could feel loved even when he wasn't there. He filled it with their story, their photos, the games they loved, and letters for each other.`,
      `They kept talking every day, until the night of September 12th. They decided to play Portal 2, a co-op puzzle game, and they worked together as more than just a team. They were a couple, solving problems side by side. Then it happened. She called him "Baby." In the moment, he brushed it off like it was nothing, but in his head and his heart, he was so flustered that all he could think was, "This girl, I love her so much." They kept playing, and he hoped it would continue. It did. The next day, she kept calling him baby, and that became the day their first monthsary began, the day they started "dating." Later, when his Discord stopped working, she gave him her IG without him even asking so they could keep talking there. He loved her even more for it.`,
    ],
  },
  {
    id: 'eight',
    label: 'Chapter Eight',
    title: 'The Question',
    color: 'var(--sky)',
    paragraphs: [
      `Their relationship grew closer. More time with each other, more love. It felt like they had known each other for a long time, an unusual but beautiful connection. Their calls went from two hours to fifteen or more, sleep calls included, and they both knew it was because they loved each other. Day after day, week after week, more and more of their time was spent with one another. She sent him pictures to use as his phone wallpaper, and he fell even more in love, seeing her every time he picked up his phone.`,
      `But then one day, she was sad. He didn't know why, so he comforted her, and she opened up. She told him she had been carrying something on her chest for a long time. She had recently come out of a breakup, a relationship she hated, one that left her in so much pain. He felt every bit of it, and the one thing that came to his mind was, "This girl, I will take care of her. She deserves to be." He comforted her, and she felt better, and he could tell.`,
      `But over the next few days, he kept reflecting on what she had said, carrying the hurt, the hate, and the pain along with it. He felt every bit of it. Then something new came: an irrational fear. He had always been fearless, brave, never scared of anything, always the one taking charge. But now a new feeling had risen, and for the first time, he knew he was afraid of losing her. Scared, he went to a friend (one who would later betray him using those same fears) and asked them to just listen, so he could get it off his chest and be free to love her and take care of her more. He told his friend, "I'm in a space where I don't know if she loves me for me or because I remind her of the feeling." His friend replied, "Maybe she treats you as a situationship." He knew what that felt like, but he didn't listen. He was offended, because he knew that wasn't it. Maybe she was just really hurt, and that's what he believed. But the doubts, the uncertainty, and the hurt had already been planted by his own fear, and that's where it all began.`,
      `Then came the 19th. He was out with his friends, with her on the phone while he was there. He wanted her to be part of everything he did, not just through updates, but by making her feel like she was really there with him as his partner. His friends kept telling him how lucky he was to have such an amazing and pretty girlfriend, and that's when it hit him. She wasn't officially his girlfriend. At first, he thought, "Oh, she likes me anyway, but I want to make her feel special. Liligawan ko sya even though alam ko gusto nya ako." So on the way home, he spent half the day building up the courage to ask her to make it official, to make her the one he truly loved.`,
      `Then the moment came. He gathered all his courage and all his love and asked her, "Charmy, will you be my girlfriend?"`,
      `At first, there was silence. He let her think. Then the silence was broken by her crying. He went into full panic mode: "Did I do something wrong? Did I make her cry? Was my question too much?" He didn't let her see it, but he took a deep breath and already understood it might be a no. And he was okay with that. She told him she couldn't answer. It hurt him, but he comforted her, told her everything was okay, and that he fully understood why. Maybe it was bad timing. Maybe it was too much. Maybe he had rushed her. He didn't know what to feel after that conversation, but one thing remained, and it never changed: his love for her. It endured, and it didn't change a single bit, because among all the uncertainties, it was the one thing he knew for certain. He loved her, truly and deeply.`,
      `Things felt awkward between them afterward. She asked if she could still call him baby, and he said yes, because he loved it when she called him that, even though at first she went back to calling him by his name. He kept encouraging her to. She asked him to fix something for her, and he tried his best, but his mind was clouded and foggy, overloaded with too many thoughts. Everything felt louder in the silence of his head while he worked on it. He was tired from his day, his heart ached, his mind raced, and he felt numb. But he loved her.`,
      `She was hurting too. She cried, remembering painful things, and he knew then that his fear had grown louder: that one day she would be gone because of what he did that day, that he might be a reminder of something painful without ever meaning to be. He was afraid. Then she said something that made him cry, and not out of sadness: "don't think I'm using you, it would definitely break my heart even more." The thoughts and voices he had kept at bay for so long, the ones nothing could quiet, she broke into nothing with those words, and he fell even more in love. It wasn't official yet, but he knew she loved him. She was just as scared as he was. So he stood tall, with all his commitment and willpower, and promised himself: "Love this girl with all I got, even if the answer will take a long time."`,
    ],
  },
  {
    id: 'nine',
    label: 'Chapter Nine',
    title: 'Thank You for Staying',
    color: 'var(--purple)',
    paragraphs: [
      `They kept loving each other. They went back to their usual selves, spending time together and enjoying their conversations. They were together. Then one day, she told him, "thank you."`,
      `"For what, baby?" he replied. "For staying with me," she said. "You deserve to be treated right because you are worth it," he told her, because that was truly how he felt. He loved this girl, truly.`,
      `"Do you love me really?" she asked. "I really do love you, with all my heart," he said, knowing it was exactly what he felt for her and nothing else. She kept asking questions, and he knew she was overthinking, so he reassured her with complete honesty. Then he said, "Thank you too, my Charmy. No one has reassured me the way that you do. I love you for it. I'll do my best to love you with all I have."`,
      `"Thank you for giving me your time and effort," she said, and he was in awe all over again. It did something to his heart, not in a bad way, but something that touched his soul. He loved her more than he could ever show her.`,
      `The days went by, and they stayed together, even with uncertainties, even when their thoughts got cloudy, even when trust wasn't fully built yet for either of them. She was more hurt when it came to trust, given what she had been through, and he understood all of it, just as she understood him. It was healthy. They were communicating. They started flirting more, something deeper for both of them, and they gave each other trust slowly but surely. There were times when she was stressed and tired from her schedule and work, and times when he was worn out from his own responsibilities, but they kept growing together. On the days she overthought and asked questions, he always answered. She was scared of being left too, and because she was so loyal, it scared her even more. But he was loyal as well. Every single time, he knew he would only choose the one who charmed him: Charmy, his true love.`,
      `She started cracking jokes with him for the first time, and he always laughed. They were genuinely funny to him, and her laugh was contagious. Every time he laughed, he loved her more for it. When she had a stressful week, he remembered how much she liked Minecraft Dungeons and wanted to play it, so he gave it to her. They played together, with her friends too. He was always a little on guard around them, but he trusted her. Afterward, she thanked him for the day and said she enjoyed it and that it helped her relieve stress, and he loved that, because what he treasures most is being appreciated. Still, she doubted herself, feeling like she didn't deserve him. But deep down, she was the one he had been praying for, so he didn't need anyone else. Only the one who charmed him.`,
    ],
  },
  {
    id: 'ten',
    label: 'Chapter Ten',
    title: 'Louder in the Silence',
    color: 'var(--green)',
    paragraphs: [
      `One day while they were playing, he told her, "Papagurin kita," during their gaming session. But he was physically tired that day from fixing his car. Still, she was his rest, so it was okay. Then it slipped out that he was tired, and she told him, "pagod kana pala sakin." He didn't know what she meant. Maybe she was joking, but he reassured her anyway. Still, he felt it. Something was wrong. She went silent, then left the call where they usually stayed together while they slept. He panicked. Something felt wrong, and now she had left the call, so he reached out on everything they were connected through. Maybe his fear was coming true. He panicked, overthought, and was scared. Then, after a few minutes, she answered and told him her internet had gone out. He wanted to believe that, but what mattered most was that she was back, and she could stay with him while she slept.`,
      `Her week was a busy one, but she kept making time for him, and he respected it whenever she needed to focus on her work, helping her wherever he could. Then things started escalating and heating up in Zelvaria. In a meeting on the 30th, he was singled out by the staff. She was furious at them for doing that to him. They kept talking about bringing back Eden and preparing for the worst with Zelvaria. She was still in the middle of hell week, and he was there for her all throughout. They talked about the meeting and the issues, but as everything kept escalating, they prepared to jump ship.`,
      `Then one day, when tensions were high, a friend of hers joined the server, an old friend she had known for a long time. He didn't think anything of it at first. But then she talked about him with so much praise, saying her friend was "good good," that he was really good at the things he did, while for her friend it was only a hobby. She kept telling him, "I'm gonna get him on Eden," and kept saying she would contact him, even though he was hard to reach and she'd have to try even niche ways. He didn't know what to feel. He was jealous of the praise she was giving. Then she said they would become even closer, since she was going to be core staff on her friend's server, and all he could think about was supporting her, even though he was feeling down.`,
      `After their call, she spent time with him, and it made things better, but he couldn't shake the feeling right away. The next day, she asked if he was okay, and to protect her, he said it was about what the Zelvaria staff had said to him, something he was trying to bury into nothing. But she was always there for him. She showed her love in quiet ways, even telling him she couldn't sleep because she was thinking about him, and he loved her for it.`,
    ],
  },
  {
    id: 'eleven',
    label: 'Chapter Eleven',
    title: 'Something That Belongs to Us',
    color: 'var(--yellow)',
    paragraphs: [
      `He brushed it off. Then came the days of planning to leave on October 4th. They kept discussing it, but they didn't worry much. Then they watched Fifty Shades of Grey, and after that, a lot changed. They flirted, and then the "therapy" sessions began, a closeness they both deeply craved. It was the first time he truly wanted someone to be with him like that, and she felt the same. It was the best first for both of them, they said, but little did they know it wouldn't be the last. It felt like they were finally touched, and they knew that when they were together, more things would "come" together.`,
      `Then the time came to leave Zelvaria. They left their messages, took action to jump ship, and took back what was rightfully theirs. Through every attack, they were together. Then came the recordings of what the staff had been saying behind their backs, with help from a good friend still in that server, and now they had it all as evidence. But some of the things said were below the belt, especially from his former friend, and it made Charmy question Vinnie's character. She had doubts, but not enough to distrust him.`,
      `Then one day, she asked him for a favor that hurt: "So you need to act na di mo ako maggustuhan ever. My friends kasi said kaya ka pala tinutulungan nung isang dev kasi may gusto sayo." He didn't know what to make of it. The first things that came to mind were, "Kinakahiya ba ako neto?" "Does she not want to be associated with me?" "Maybe it's just because of the issue." He chose to believe the third. But when she asked what was wrong and he told her, she said, "siguro nasanay kasi ako sa relationship na hndi showy," which had been his intention from the start. He only ever wanted to show his love to her. "kaya ayoko ng very pro-active sa relationship," she said. Then she added, "I just don't feel the need to make everything about our relationship public or show it off to other people. I'd rather what we have feel genuine and be something that belongs to us, not something we have to prove to everyone else."`,
      `It hurt him, but he understood her more, and he accepted and respected what she wanted. After that, they let it go, carried on with the recordings, and through that week, they still chose each other, though it stayed with him. Even with her mind clouded by the things she had heard, even when she asked whether they should stop what they had (which he would never want), she stayed. She trusted him even when every sign was warning her, and she chose him, and he fell even more in love with her.`,
      `But the next day, he wasn't himself. It was as if he wanted to cut off everyone around him just to prove to her that he kept his word, but he didn't really know what he was doing. He was emotionally exhausted from everything being said about him, but he stayed strong and focused, with all his willpower, to prove that he wasn't the bad man everyone painted him to be. To prove it to her.`,
      `The truth is, before he met her, he was reclusive. He chose to vanish because he didn't care what people would think if he left. But with Charmy, that thought never even crossed his overthinking mind, because he loved her that much. Still, he wanted to distance himself from her to protect her from himself, from all the things being said that weren't true. If it meant burning the world, he would do it twice for her. But she didn't want that. She wanted to be with him through everything, no matter what happened. And that's when she said, "I love you." It meant the world to him, something he wanted to protect, something that made him feel safe. She gave him a whole world, one he would cherish and protect, one that gave him peace and safety, and he loved her even more for it.`,
    ],
  },
  {
    id: 'twelve',
    label: 'Chapter Twelve',
    title: 'Worth It All',
    color: 'var(--teal)',
    paragraphs: [
      `Then came the 12th. She didn't know what the 12th meant, but he did, and he had kept it in his heart all along. It was the day she first called him baby, the day they truly became a couple, the start of their monthsary. October 12th marked their first. He gave her a heartwarming letter with all his love poured into it, because his love for her simply never runs out. She appreciated it and told him so, and he loved her for it. After that, they loved each other a whole lot more, with more therapy sessions included.`,
      `Then one day, he sang for her. He sang with love, something he had never done for anyone before, and had never really done at all. But she was his number one fan. Then she suddenly went quiet. Something was wrong; he could feel it. He asked her about it, but she kept avoiding it until the next day. She was doubting herself, wondering whether she was worth it, whether her love was enough for him. She thought she wasn't enough. But little did she know there was no measuring her love. He loved her for exactly who she was, and he didn't need or want anyone better, because he only wanted and needed Charmy, always. He reassured her, and she just said, "fuck it we ball." He knew she was risking it all, and he told himself, "I love this girl. I won't let her down." He knew she loved him genuinely too. He wasn't doubting her; he was just scared. But once again, they chose each other, followed by another therapy session.`,
      `One day, while they were in a call with her friends, she kept calling an unfamiliar guy something he kept mishearing as "Baby." It made him uncomfortable, but he brushed it off and tried to sleep, though he told her honestly, because she was his everything now. Then she explained what she had really said, and he apologized for the mistake and loved her even more for being open with him, followed by another therapy session. During one of their intimate moments, a playful "bad girl" from him came across the wrong way, and she thought he meant it. He had only meant it as teasing, and he just wanted to understand what she was comfortable with. So they talked it through, understood each other, and they were okay.`,
      `Through one conversation, he learned when her birthday was, and he wanted to prepare something special for her, something he had never done for anyone else. He decided to play the guitar for her as a birthday gift, something he would pour real effort into since the distance kept them apart. She was going on vacation to France and had no idea he was preparing anything, because it was a surprise. Then came a letter of love and birthday wishes, along with a video of a song, a little rough around the edges, but full of love. She loved it. She was so happy, and seeing her happy made him happy too.`,
      `After that day, he understood everything. Charmy isn't very expressive, but she loves him genuinely. She may show her feelings in quiet ways, but he could feel her love through all of it. Charmy is worth the fight. She is the one Vincent truly loves, and she is worth it all.`,
    ],
  },
  {
    id: 'thirteen',
    label: 'Chapter Thirteen',
    title: 'Coming Soon',
    color: '#9a94ab',
    comingSoon: true,
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
                  className={`story-tab${activeChapter === chapter.id ? ' active' : ''}${chapter.comingSoon ? ' coming-soon' : ''}`}
                  onClick={() => scrollToChapter(chapter.id)}
                >
                  {chapter.comingSoon ? `${chapter.label} 🔒` : chapter.label}
                </button>
              ))}
            </div>

            {CHAPTERS.map((chapter, index) => (
              <motion.section
                key={chapter.id}
                ref={(el) => (chapterRefs.current[chapter.id] = el)}
                className={`story-chapter${chapter.comingSoon ? ' coming-soon' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <span className="story-chapter-tag" style={{ '--tag-color': chapter.color }}>
                  {chapter.label}
                </span>
                {chapter.comingSoon ? (
                  <>
                    <h2 className="story-chapter-title">Coming Soon &hearts;</h2>
                    <p className="story-chapter-body coming-soon-body">
                      This chapter hasn&apos;t been written yet. The story's still going, Mein
                      Schatz, check back soon.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="story-chapter-title">{chapter.title}</h2>
                    <p className="story-chapter-body">{chapter.paragraphs[0]}</p>
                    <button
                      type="button"
                      className="story-read-more"
                      onClick={() => setOpenChapter(chapter)}
                    >
                      Read More <span aria-hidden="true">&rarr;</span>
                    </button>
                  </>
                )}
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
