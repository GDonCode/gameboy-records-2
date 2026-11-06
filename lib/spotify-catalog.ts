// lib/spotify-catalog.ts
// Alexx A-Game on Spotify, as of November 2026: cover art and track links for every release he's credited on.
// Read from the public Spotify pages (the Spotify Web API needs the app owner to have Premium). When a new song
// comes out on Spotify, add it here; songs that also have an official video on YouTube are matched by title
// (see lib/discography.ts) and get their cover and Spotify link from this list.

const cover = (id: string) => `https://i.scdn.co/image/ab67616d0000b273${id}`;

export interface SpotifyRelease {
  /** Song title, as the site shows it. */
  title: string;
  /** Spotify track id, for links and the embedded player. */
  trackId: string;
  /** Square cover art, 640px. */
  cover: string;
  /** ISO release date on Spotify. */
  releasedAt: string;
  /** Who's credited, when it isn't only Alexx A-Game. */
  credit: string | null;
  /** The record it came out on, when it isn't a single of the same name. */
  project: string | null;
  label: string;
  /** Only on Spotify (no official video on YouTube). */
  spotifyOnly: boolean;
  appleUrl?: string;
}

export const SPOTIFY_RELEASES: SpotifyRelease[] = [
  { title: 'Gangsters', trackId: '1sZyvjKIGfaXKxdlkYraa0', cover: cover('8fb7a12703994a68c5138a6e'), releasedAt: '2016-04-15', credit: 'Famous Eno feat. Alexx A-Game, Serocee & Fox', project: null, label: 'Swing Ting', spotifyOnly: true },
  { title: 'High', trackId: '41GnDRRnwJRAFaqa7ZeJV7', cover: cover('198a8f6c54e31c9ba9c35e1b'), releasedAt: '2016-06-24', credit: 'Ghetto Vanessa & Alexx A-Game', project: 'Ghetto Bird Saga 1', label: 'Equiknoxx Music', spotifyOnly: true },
  { title: 'Only Time Will Tell', trackId: '0l2OokLZmqm3mojLQyKGjN', cover: cover('14b1c25d9ab7ede9a865afbe'), releasedAt: '2016-07-08', credit: null, project: 'Cloud Ten Riddim', label: 'Elite Generation Records', spotifyOnly: false },
  { title: 'I Know', trackId: '0JLluWc6YctD9JvnWGLmzb', cover: cover('133a1d463274c90d2e5739a4'), releasedAt: '2017-06-30', credit: null, project: null, label: 'Irievibrations Records', spotifyOnly: true },
  { title: 'Braver (Swing Ting Smooth Edit)', trackId: '0ixjFQxHJKDLZ2Kibz3wkp', cover: cover('269c9f4a599e1e7b205606f0'), releasedAt: '2017-07-06', credit: 'Alexx A-Game & Swing Ting', project: 'Braver (Swing Ting Edits)', label: 'Swing Ting', spotifyOnly: true },
  { title: 'Free up Your Mind', trackId: '6GzKchk1ptPzbs9nchp0sH', cover: cover('6699b1e981d4ca84b8415951'), releasedAt: '2017-12-01', credit: 'Swing Ting feat. Alexx A-Game', project: 'Junction EP', label: 'Swing Ting', spotifyOnly: true },
  { title: 'Step Inna The Place', trackId: '13lguUPe8Uo3dKEeIFIi2j', cover: cover('76975bf27d3a8ce56e7434de'), releasedAt: '2017-12-08', credit: 'Alexx A-Game & Irievibrations', project: 'Gratitude Riddim Selection', label: 'Irievibrations Records', spotifyOnly: true },
  { title: 'Double', trackId: '0QjHl5W8pvBoJbcoCtFyKi', cover: cover('d4a143d2dc98fc533656aa81'), releasedAt: '2018-08-31', credit: 'Alexx A-Game feat. Tory Lanez', project: null, label: 'Real N True Ent / DubShot', spotifyOnly: false },
  { title: 'Chuck It', trackId: '0TMt1EtpsvOQdhqnxx3vr9', cover: cover('9afe5b11d6092ccbe162ceb3'), releasedAt: '2019-01-25', credit: 'Alexx A-Game & Ding Dong', project: null, label: 'Real N True Ent / DubShot', spotifyOnly: false },
  { title: 'Real To Di Link', trackId: '5ijJfDJUJd1lj2DiZobu2j', cover: cover('4d857693955ffe1cba770e6a'), releasedAt: '2019-02-22', credit: null, project: 'Lonely Road Riddim', label: 'Seanizzle Records', spotifyOnly: false },
  { title: 'My Typa Badness', trackId: '3Wf9r9gN6Ol4l2UnzJEdkw', cover: cover('83551a7ee23273504f4bf7fa'), releasedAt: '2020-12-18', credit: 'Alexx A-Game & Dub Akom', project: 'Lose Control Riddim', label: 'Akom Records', spotifyOnly: false },
  { title: 'Lose Control Riddim (Mix)', trackId: '75Cq3gpCRbh6MWrtLoo9J8', cover: cover('fc9e95fae6e0129e76dd22e5'), releasedAt: '2021-04-09', credit: 'Million Stylez, Tamo J, Alexx A-Game & Dub Akom', project: null, label: 'Akom Records', spotifyOnly: true },
  { title: 'Braver (Satl Remix)', trackId: '26Jp1hthbK239rgrRT9REc', cover: cover('5a351d35b9abf4b10de3fb86'), releasedAt: '2021-12-10', credit: 'Alexx A-Game & Satl', project: null, label: 'The North Quarter', spotifyOnly: true },
  { title: 'Hurt Inside', trackId: '2v2RFoDTW8GbPD6pFmDgAM', cover: cover('620833801774b78342b372b0'), releasedAt: '2022-07-26', credit: null, project: null, label: "God's Work Music Group", spotifyOnly: false },
  { title: 'More Life', trackId: '45oAzN98i2vwKoaS6CfNrl', cover: cover('4ec562b27a08c2cf5b53c8ed'), releasedAt: '2024-01-19', credit: null, project: null, label: 'Alexx A-Game', spotifyOnly: false },
  {
    title: 'Rise Up Now (Guitar Version)',
    trackId: '3tcAFyDjx0YBBJ2Y6TvVVh',
    cover: cover('00e8aceb70f922ca7da5cd96'),
    releasedAt: '2026-09-11',
    credit: null,
    project: null,
    label: 'GameBoy Records',
    spotifyOnly: false,
    appleUrl: 'https://music.apple.com/us/song/rise-up-now-guitar-version/6809729519',
  },
  {
    title: 'Still A Rise',
    trackId: '6x4zWKWNHfCzWDDMPJaG7N',
    cover: cover('30fc7472bc66afc8bb1884a7'),
    releasedAt: '2026-09-25',
    credit: null,
    project: null,
    label: 'GameBoy Records',
    spotifyOnly: false,
    appleUrl: 'https://music.apple.com/us/album/still-a-rise-single/6808531561',
  },
];

export const spotifyTrackUrl = (trackId: string) => `https://open.spotify.com/track/${trackId}`;
