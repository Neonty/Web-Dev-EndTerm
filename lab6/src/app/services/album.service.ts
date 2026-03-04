import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Album } from '../models/album.model';
import { Photo } from '../models/photo.model';

export const ALBUMS: Album[] = [
  { id: 1,   userId: 1, title: 'Fullmetal Alchemist: Brotherhood' },
  { id: 2,   userId: 1, title: 'Steins;Gate' },
  { id: 3,   userId: 1, title: 'Hunter x Hunter' },
  { id: 4,   userId: 1, title: 'Neon Genesis Evangelion' },
  { id: 5,   userId: 1, title: 'Cowboy Bebop' },
  { id: 6,   userId: 1, title: 'Violet Evergarden' },
  { id: 7,   userId: 1, title: 'Your Lie in April' },
  { id: 8,   userId: 1, title: 'Attack on Titan' },
  { id: 9,   userId: 1, title: 'Death Note' },
  { id: 10,  userId: 1, title: 'Code Geass' },
  { id: 11,  userId: 2, title: 'Demon Slayer' },
  { id: 12,  userId: 2, title: 'One Punch Man' },
  { id: 13,  userId: 2, title: 'Mob Psycho 100' },
  { id: 14,  userId: 2, title: 'Re:Zero' },
  { id: 15,  userId: 2, title: 'Vinland Saga' },
  { id: 16,  userId: 2, title: 'Jujutsu Kaisen' },
  { id: 17,  userId: 2, title: 'Banana Fish' },
  { id: 18,  userId: 2, title: 'Darling in the FranXX' },
  { id: 19,  userId: 2, title: 'Clannad: After Story' },
  { id: 20,  userId: 2, title: 'Anohana: The Flower We Saw That Day' },
  { id: 21,  userId: 3, title: 'March Comes in Like a Lion' },
  { id: 22,  userId: 3, title: 'A Silent Voice' },
  { id: 23,  userId: 3, title: 'Your Name' },
  { id: 24,  userId: 3, title: 'Spirited Away' },
  { id: 25,  userId: 3, title: 'Princess Mononoke' },
  { id: 26,  userId: 3, title: 'Howls Moving Castle' },
  { id: 27,  userId: 3, title: 'Wolf Children' },
  { id: 28,  userId: 3, title: 'The Garden of Words' },
  { id: 29,  userId: 3, title: 'Grave of the Fireflies' },
  { id: 30,  userId: 3, title: 'Plastic Memories' },
  { id: 31,  userId: 4, title: 'Charlotte' },
  { id: 32,  userId: 4, title: 'Angel Beats' },
  { id: 33,  userId: 4, title: 'Toradora' },
  { id: 34,  userId: 4, title: 'Sword Art Online' },
  { id: 35,  userId: 4, title: 'No Game No Life' },
  { id: 36,  userId: 4, title: 'Overlord' },
  { id: 37,  userId: 4, title: 'Black Clover' },
  { id: 38,  userId: 4, title: 'Fairy Tail' },
  { id: 39,  userId: 4, title: 'Naruto Shippuden' },
  { id: 40,  userId: 4, title: 'Bleach' },
  { id: 41,  userId: 5, title: 'Dragon Ball Z' },
  { id: 42,  userId: 5, title: 'One Piece' },
  { id: 43,  userId: 5, title: 'My Hero Academia' },
  { id: 44,  userId: 5, title: 'Tokyo Ghoul' },
  { id: 45,  userId: 5, title: 'Parasyte: The Maxim' },
  { id: 46,  userId: 5, title: 'Akame ga Kill' },
  { id: 47,  userId: 5, title: 'Assassination Classroom' },
  { id: 48,  userId: 5, title: 'The Promised Neverland' },
  { id: 49,  userId: 5, title: 'Made in Abyss' },
  { id: 50,  userId: 5, title: 'Kabaneri of the Iron Fortress' },
  { id: 51,  userId: 6, title: '86 — Eighty Six' },
  { id: 52,  userId: 6, title: 'Saga of Tanya the Evil' },
  { id: 53,  userId: 6, title: 'The Rising of the Shield Hero' },
  { id: 54,  userId: 6, title: 'Jobless Reincarnation' },
  { id: 55,  userId: 6, title: 'That Time I Got Reincarnated as a Slime' },
  { id: 56,  userId: 6, title: 'KonoSuba' },
  { id: 57,  userId: 6, title: 'Sword Art Online: Alicization' },
  { id: 58,  userId: 6, title: 'Black Lagoon' },
  { id: 59,  userId: 6, title: 'Trigun' },
  { id: 60,  userId: 6, title: 'Samurai Champloo' },
  { id: 61,  userId: 7, title: 'Gurren Lagann' },
  { id: 62,  userId: 7, title: 'Kill la Kill' },
  { id: 63,  userId: 7, title: 'Little Witch Academia' },
  { id: 64,  userId: 7, title: 'My Neighbor Totoro' },
  { id: 65,  userId: 7, title: 'Nausicaä of the Valley of the Wind' },
  { id: 66,  userId: 7, title: 'Castle in the Sky' },
  { id: 67,  userId: 7, title: "Kiki's Delivery Service" },
  { id: 68,  userId: 7, title: 'Porco Rosso' },
  { id: 69,  userId: 7, title: 'Whisper of the Heart' },
  { id: 70,  userId: 7, title: 'The Secret World of Arrietty' },
  { id: 71,  userId: 8, title: 'From Up on Poppy Hill' },
  { id: 72,  userId: 8, title: 'The Wind Rises' },
  { id: 73,  userId: 8, title: 'When Marnie Was There' },
  { id: 74,  userId: 8, title: 'Weathering With You' },
  { id: 75,  userId: 8, title: 'Belle' },
  { id: 76,  userId: 8, title: 'Mirai' },
  { id: 77,  userId: 8, title: 'I Want to Eat Your Pancreas' },
  { id: 78,  userId: 8, title: 'Maquia: When the Promised Flower Blooms' },
  { id: 79,  userId: 8, title: 'The Boy and the Heron' },
  { id: 80,  userId: 8, title: 'Suzume' },
  { id: 81,  userId: 9, title: 'Josee the Tiger and the Fish' },
  { id: 82,  userId: 9, title: 'Liz and the Blue Bird' },
  { id: 83,  userId: 9, title: 'A Whisker Away' },
  { id: 84,  userId: 9, title: 'Children of the Sea' },
  { id: 85,  userId: 9, title: 'Ride Your Wave' },
  { id: 86,  userId: 9, title: 'Words Bubble Up Like Soda Pop' },
  { id: 87,  userId: 9, title: 'Flavor of Youth' },
  { id: 88,  userId: 9, title: 'The Colors Within' },
  { id: 89,  userId: 9, title: 'Tsurune' },
  { id: 90,  userId: 9, title: 'Free! Iwatobi Swim Club' },
  { id: 91,  userId: 10, title: 'Haikyu!!' },
  { id: 92,  userId: 10, title: "Kuroko's Basketball" },
  { id: 93,  userId: 10, title: 'Ping Pong the Animation' },
  { id: 94,  userId: 10, title: 'Yuri on Ice' },
  { id: 95,  userId: 10, title: 'Blue Lock' },
  { id: 96,  userId: 10, title: 'Slam Dunk' },
  { id: 97,  userId: 10, title: 'Hajime no Ippo' },
  { id: 98,  userId: 10, title: 'Eyeshield 21' },
  { id: 99,  userId: 10, title: 'Captain Tsubasa' },
  { id: 100, userId: 10, title: 'Ashita no Joe' },
];

const ANIME_MAL_IDS: number[] = [
  5114,   // Fullmetal Alchemist: Brotherhood
  9253,   // Steins;Gate
  11061,  // Hunter x Hunter
  30,     // Neon Genesis Evangelion
  1,      // Cowboy Bebop
  33352,  // Violet Evergarden
  23273,  // Your Lie in April
  16498,  // Attack on Titan
  1535,   // Death Note
  1575,   // Code Geass
  47778,  // Demon Slayer
  30276,  // One Punch Man
  32182,  // Mob Psycho 100
  31240,  // Re:Zero
  37521,  // Vinland Saga
  40748,  // Jujutsu Kaisen
  36649,  // Banana Fish
  35849,  // Darling in the FranXX
  4181,   // Clannad: After Story
  6351,   // Anohana
  28999,  // March Comes in Like a Lion
  28851,  // A Silent Voice
  32281,  // Your Name
  199,    // Spirited Away
  164,    // Princess Mononoke
  431,    // Howls Moving Castle
  13587,  // Wolf Children
  16782,  // The Garden of Words
  578,    // Grave of the Fireflies
  27775,  // Plastic Memories
  28999,  // Charlotte (reuse)
  6547,   // Angel Beats
  4224,   // Toradora
  11757,  // Sword Art Online
  19815,  // No Game No Life
  29803,  // Overlord
  28701,  // Black Clover
  6702,   // Fairy Tail
  1735,   // Naruto Shippuden
  269,    // Bleach
  813,    // Dragon Ball Z
  21,     // One Piece
  31964,  // My Hero Academia
  22319,  // Tokyo Ghoul
  22535,  // Parasyte
  27989,  // Akame ga Kill
  24833,  // Assassination Classroom
  37779,  // The Promised Neverland
  34599,  // Made in Abyss
  27833,  // Kabaneri
  41457,  // 86 Eighty Six
  38474,  // Saga of Tanya the Evil
  35790,  // Shield Hero
  39535,  // Jobless Reincarnation
  36862,  // That Time I Got Reincarnated as a Slime
  30831,  // KonoSuba
  36475,  // SAO Alicization
  1519,   // Black Lagoon
  6,      // Trigun
  205,    // Samurai Champloo
  2001,   // Gurren Lagann
  13601,  // Kill la Kill
  33489,  // Little Witch Academia
  523,    // My Neighbor Totoro
  572,    // Nausicaa
  2890,   // Castle in the Sky
  382,    // Kikis Delivery Service
  409,    // Porco Rosso
  1686,   // Whisper of the Heart
  9989,   // Arrietty
  10030,  // From Up on Poppy Hill
  16662,  // The Wind Rises
  20687,  // When Marnie Was There
  38826,  // Weathering With You
  41389,  // Belle
  37779,  // Mirai
  35839,  // I Want to Eat Your Pancreas
  35851,  // Maquia
  49596,  // The Boy and the Heron
  51011,  // Suzume
  40804,  // Josee the Tiger and the Fish
  36106,  // Liz and the Blue Bird
  40815,  // A Whisker Away
  38414,  // Children of the Sea
  38474,  // Ride Your Wave
  41389,  // Words Bubble Up Like Soda Pop
  35073,  // Flavor of Youth
  49596,  // The Colors Within
  36038,  // Tsurune
  21689,  // Free!
  20583,  // Haikyu
  28235,  // Kurokos Basketball
  23067,  // Ping Pong
  32995,  // Yuri on Ice
  49596,  // Blue Lock
  170,    // Slam Dunk
  263,    // Hajime no Ippo
  3986,   // Eyeshield 21
  2461,   // Captain Tsubasa
  1254,   // Ashita no Joe
];

const photoCache = new Map<number, Photo[]>();

@Injectable({ providedIn: 'root' })
export class AlbumService {

  private albums: Album[] = [...ALBUMS];

  constructor(private http: HttpClient) {}

  getAlbums(): Observable<Album[]> {
    return of([...this.albums]);
  }

  getAlbum(id: number): Observable<Album> {
    const album = this.albums.find(a => a.id === id);
    return of(album ? { ...album } : { id, userId: 1, title: 'Unknown' });
  }

  getAlbumPhotos(albumId: number): Observable<Photo[]> {
    if (photoCache.has(albumId)) {
      return of(photoCache.get(albumId)!);
    }

    const malId = ANIME_MAL_IDS[albumId - 1];
    const animeTitle = ALBUMS[albumId - 1]?.title ?? 'Anime';

    return this.http
      .get<any>(`https://api.jikan.moe/v4/anime/${malId}/characters`)
      .pipe(
        map((res) => {
          const characters = res.data ?? [];
          const photos: Photo[] = characters
            .filter((c: any) => c.character?.images?.jpg?.image_url)
            .slice(0, 30)
            .map((c: any, i: number) => ({
              id: (albumId - 1) * 50 + i + 1,
              albumId,
              title: c.character.name,
              url: c.character.images.jpg.image_url,
              thumbnailUrl: c.character.images.jpg.image_url,
            }));

          const result = photos.length > 0 ? photos : this.fallbackPhotos(albumId, animeTitle);
          photoCache.set(albumId, result);
          return result;
        }),
        catchError(() => {
          const fallback = this.fallbackPhotos(albumId, animeTitle);
          photoCache.set(albumId, fallback);
          return of(fallback);
        })
      );
  }

  private fallbackPhotos(albumId: number, title: string): Photo[] {
    const photos: Photo[] = [];
    for (let i = 1; i <= 20; i++) {
      const seed = (albumId - 1) * 50 + i;
      photos.push({
        id: seed,
        albumId,
        title: `${title} — Scene ${i}`,
        url: `https://picsum.photos/seed/anime${seed}/600/600`,
        thumbnailUrl: `https://picsum.photos/seed/anime${seed}/150/150`,
      });
    }
    return photos;
  }

  updateAlbum(album: Album): Observable<Album> {
    const index = this.albums.findIndex(a => a.id === album.id);
    if (index !== -1) this.albums[index] = { ...album };
    return of({ ...album });
  }

  deleteAlbum(id: number): Observable<void> {
    this.albums = this.albums.filter(a => a.id !== id);
    return of(void 0);
  }
}