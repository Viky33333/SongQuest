"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

/* =========================================================================
   SongQuest — app/dashboard/page.tsx (Next.js App Router, client component)
   Tabs: Search Songs · Learning Path · Backing Tracks
   ========================================================================= */

/* ---------------------------------- Design tokens ---------------------------------- */
const COLORS = {
  bg: "#140F0A",
  bgSoft: "#241611",
  wood: "#3B2418",
  woodLight: "#5A3724",
  amber: "#E8A33D",
  amberSoft: "#F4C96E",
  cream: "#FBEFD8",
  creamDim: "#D7C2A0",
  teal: "#3FD9C4",
  coral: "#E8604C",
  magenta: "#C84F8F",
  plum: "#6A2E4C",
} as const;

/* ---------------------------------- Types ---------------------------------- */
type Difficulty = "Easy" | "Medium" | "Hard";

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  difficulty: Difficulty;
  bpm: number;
  key?: string;
  skills: [string, string, string];
}

interface Progress {
  completed: string[];
  xp: number;
}

interface Chord {
  root: string;
  intervals: number[];
  label: string;
}

/* ---------------------------------- Song library ---------------------------------- */
/* Titles/artists are factual metadata only — no lyrics or tab transcriptions. */
const SONGS: Song[] = [
  { id: "wonderwall", title: "Wonderwall", artist: "Oasis", genre: "Rock", difficulty: "Easy", bpm: 87, key: "F#m",
    skills: ["Basic open chords", "Steady down-strumming", "Chord-to-chord transitions"] },
  { id: "knockin", title: "Knockin' on Heaven's Door", artist: "Bob Dylan", genre: "Folk Rock", difficulty: "Easy", bpm: 72, key: "G",
    skills: ["Open chords (G/D/Am/C)", "Simple strum pattern", "Steady tempo control"] },
  { id: "horse", title: "Horse With No Name", artist: "America", genre: "Folk Rock", difficulty: "Easy", bpm: 121, key: "Em",
    skills: ["Two-chord vamping", "Percussive muting", "Syncopated strumming"] },
  { id: "sweethome", title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", genre: "Southern Rock", difficulty: "Medium", bpm: 98, key: "D",
    skills: ["Alternating bass notes", "Triad shapes up the neck", "Palm muting"] },
  { id: "seventeen", title: "Seven Nation Army", artist: "The White Stripes", genre: "Rock", difficulty: "Medium", bpm: 124, key: "Em",
    skills: ["Riff picking accuracy", "Octave shapes", "Muted low-string attack"] },
  { id: "blackbird", title: "Blackbird", artist: "The Beatles", genre: "Fingerstyle", difficulty: "Hard", bpm: 96, key: "G",
    skills: ["Travis picking", "Independent thumb/finger voices", "Melodic fingerstyle phrasing"] },
  { id: "layla", title: "Layla (Unplugged)", artist: "Eric Clapton", genre: "Blues Rock", difficulty: "Hard", bpm: 78, key: "Dm",
    skills: ["Fingerstyle chord rolls", "Bass-note walk-ups", "Dynamic control"] },
  { id: "dust", title: "Dust in the Wind", artist: "Kansas", genre: "Fingerstyle", difficulty: "Medium", bpm: 88, key: "C",
    skills: ["Fingerpicking patterns", "Alternating bass thumb", "Smooth chord voicing changes"] },
  { id: "classical", title: "Classical Gas", artist: "Mason Williams", genre: "Instrumental", difficulty: "Hard", bpm: 150, key: "Em",
    skills: ["Fast alternate picking", "Position shifting", "Right-hand precision at tempo"] },
  { id: "littlewing", title: "Little Wing", artist: "Jimi Hendrix", genre: "Blues Rock", difficulty: "Hard", bpm: 76, key: "Em",
    skills: ["Chord-embellishment (melodic fills)", "Thumb-over barre technique", "Expressive bends within chords"] },
  { id: "stairway", title: "Stairway to Heaven", artist: "Led Zeppelin", genre: "Classic Rock", difficulty: "Hard", bpm: 82, key: "Am",
    skills: ["Arpeggiated fingerpicking", "Barre chord transitions", "Dynamic build & tempo shifts"] },
  { id: "tears", title: "Tears in Heaven", artist: "Eric Clapton", genre: "Fingerstyle", difficulty: "Medium", bpm: 78, key: "A",
    skills: ["Fingerstyle patterns", "Bass-note independence", "Smooth chord-to-chord picking"] },
  { id: "hotelcali", title: "Hotel California", artist: "Eagles", genre: "Classic Rock", difficulty: "Hard", bpm: 74, key: "Bm",
    skills: ["Arpeggios across 6 chords", "Precise fingerstyle timing", "Barre & partial-barre shapes"] },
  { id: "banks", title: "Banks of the Ohio", artist: "Traditional", genre: "Folk", difficulty: "Easy", bpm: 92, key: "G",
    skills: ["Open chords (G/C/D)", "Consistent strum pattern", "Basic fingerpicking intro"] },
  { id: "everlong", title: "Everlong", artist: "Foo Fighters", genre: "Alt Rock", difficulty: "Medium", bpm: 158, key: "D",
    skills: ["Palm-muted picking", "Syncopated riff accuracy", "Dynamic shifts (soft to loud)"] },
  { id: "zombie", title: "Zombie", artist: "The Cranberries", genre: "Alternative", difficulty: "Easy", bpm: 112, key: "Em",
    skills: ["Basic power-chord shapes", "Steady rhythm strumming", "Simple chord changes"] },
  { id: "sweetcaroline", title: "Sweet Caroline", artist: "Neil Diamond", genre: "Pop Rock", difficulty: "Easy", bpm: 100, key: "G",
    skills: ["Open chord strumming", "Chord timing with singalong feel", "Basic groove maintenance"] },
  { id: "badmoon", title: "Bad Moon Rising", artist: "Creedence Clearwater Revival", genre: "Roots Rock", difficulty: "Easy", bpm: 92, key: "A",
    skills: ["Simple down-up strumming", "Quick chord transitions", "Consistent tempo"] },
  { id: "ringthemood", title: "Ring Them Bells", artist: "Bob Dylan", genre: "Folk", difficulty: "Easy", bpm: 86, key: "C",
    skills: ["Basic fingerpicking", "Open chord movement", "Relaxed picking control"] },
  { id: "browneyedgirl", title: "Brown Eyed Girl", artist: "Van Morrison", genre: "Rock", difficulty: "Medium", bpm: 104, key: "G",
    skills: ["Accent-driven strumming", "Chord change precision", "Phrasing with groove"] },
  { id: "island", title: "Island in the Sun", artist: "Weezer", genre: "Pop Rock", difficulty: "Medium", bpm: 122, key: "D",
    skills: ["Repeatable strum pattern", "Clean chord voicings", "Dynamic contrast"] },
  { id: "herecomes", title: "Here Comes the Sun", artist: "The Beatles", genre: "Pop", difficulty: "Medium", bpm: 128, key: "A",
    skills: ["Arpeggiated picking", "Smooth transition shaping", "Light fingerstyle articulation"] },
  { id: "rumblin", title: "Rumble", artist: "Link Wray", genre: "Instrumental Rock", difficulty: "Medium", bpm: 136, key: "E",
    skills: ["Aggressive muting", "Riff consistency", "Palm-muted attack"] },
  { id: "smellsteen", title: "Smells Like Teen Spirit", artist: "Nirvana", genre: "Grunge", difficulty: "Medium", bpm: 168, key: "F#",
    skills: ["Power-chord rhythm accuracy", "Muted strumming control", "Punchy riff timing"] },
  { id: "superstar", title: "Superstar", artist: "Carpenters", genre: "Soft Rock", difficulty: "Hard", bpm: 90, key: "C",
    skills: ["Fingerstyle accompaniment", "Chord voicing control", "Balanced arpeggios"] },
  { id: "fascination", title: "Fascination Street", artist: "The Cure", genre: "Alternative", difficulty: "Hard", bpm: 132, key: "Em",
    skills: ["Syncopated rhythm", "Barre shape stability", "Texture shifts"] },
  { id: "sultans", title: "Sultans of Swing", artist: "Dire Straits", genre: "Blues Rock", difficulty: "Hard", bpm: 96, key: "Am",
    skills: ["Fingerstyle groove", "Muted bass movement", "Precise picking accents"] },
  { id: "redemption", title: "Redemption Song", artist: "Bob Marley", genre: "Reggae", difficulty: "Hard", bpm: 92, key: "G",
    skills: ["Reggae strumming", "Off-beat accents", "Tone control and muting"] },
  { id: "wildthing", title: "Wild Thing", artist: "The Troggs", genre: "Garage Rock", difficulty: "Easy", bpm: 128, key: "E",
    skills: ["Power-chord riffs", "Simple groove", "Fast transitions"] },
  { id: "home", title: "Home", artist: "Edward Sharpe & The Magnetic Zeros", genre: "Indie Folk", difficulty: "Easy", bpm: 94, key: "G",
    skills: ["Open chord strumming", "Steady rhythm", "Relaxed picking"] },
  { id: "loveboat", title: "Love Boat", artist: "The Happy Days", genre: "Pop", difficulty: "Easy", bpm: 118, key: "C",
    skills: ["Basic chord changes", "Light rhythm", "Simple groove"] },
  { id: "sistergolden", title: "Sister Golden Hair", artist: "America", genre: "Soft Rock", difficulty: "Easy", bpm: 102, key: "D",
    skills: ["Gentle strumming", "Clean transitions", "Chord timing"] },
  { id: "londoncalling", title: "London Calling", artist: "The Clash", genre: "Punk Rock", difficulty: "Easy", bpm: 132, key: "A",
    skills: ["Short power chords", "Punchy rhythm", "Quick changes"] },
  { id: "riptide", title: "Riptide", artist: "Vance Joy", genre: "Indie Pop", difficulty: "Easy", bpm: 104, key: "Am",
    skills: ["Muted strums", "Simple fingerpicking", "Steady timing"] },
  { id: "useme", title: "Use Me", artist: "Bill Withers", genre: "Soul", difficulty: "Easy", bpm: 108, key: "G",
    skills: ["Basic groove", "Accent placement", "Persistent rhythm"] },
  { id: "aintno", title: "Ain't No Sunshine", artist: "Bill Withers", genre: "Soul", difficulty: "Easy", bpm: 80, key: "Am",
    skills: ["Slow chord movement", "Warm tone", "Simple dynamics"] },
  { id: "sugarbaby", title: "Sugar Baby Love", artist: "The Rubettes", genre: "Pop", difficulty: "Easy", bpm: 124, key: "D",
    skills: ["Straight strums", "Chord switching", "Light groove"] },
  { id: "dreams", title: "Dreams", artist: "Fleetwood Mac", genre: "Classic Rock", difficulty: "Easy", bpm: 120, key: "G",
    skills: ["Open chord flow", "Smooth transitions", "Relaxed swing"] },
  { id: "yellow", title: "Yellow", artist: "Coldplay", genre: "Alternative", difficulty: "Easy", bpm: 88, key: "G",
    skills: ["Basic arpeggios", "Gentle rhythm", "Simple fingerpicking"] },
  { id: "timeinthebottle", title: "Time in a Bottle", artist: "Jim Croce", genre: "Folk Pop", difficulty: "Medium", bpm: 92, key: "C",
    skills: ["Arpeggiated chords", "Fingerstyle control", "Dynamic shaping"] },
  { id: "lullaby", title: "Lullaby", artist: "The Cure", genre: "Alternative", difficulty: "Medium", bpm: 112, key: "Am",
    skills: ["Mood-based strumming", "Barre chord stability", "Gentle accents"] },
  { id: "dontstop", title: "Don't Stop Believin'", artist: "Journey", genre: "Rock", difficulty: "Medium", bpm: 118, key: "E",
    skills: ["Chord movement fluency", "Rhythmic consistency", "Drive and lift"] },
  { id: "takeiteasy", title: "Take It Easy", artist: "Eagles", genre: "Country Rock", difficulty: "Medium", bpm: 100, key: "G",
    skills: ["Country-style strumming", "Clean chord change timing", "Groove control"] },
  { id: "madworld", title: "Mad World", artist: "Gary Jules", genre: "Alternative", difficulty: "Medium", bpm: 84, key: "Am",
    skills: ["Slow fingerpicking", "Arpeggio flow", "Dynamic softness"] },
  { id: "wonderfultonight", title: "Wonderful Tonight", artist: "Eric Clapton", genre: "Soft Rock", difficulty: "Medium", bpm: 96, key: "E",
    skills: ["Clean chord voicing", "Chord timing", "Gentle dynamics"] },
  { id: "freebird", title: "Free Bird", artist: "Lynyrd Skynyrd", genre: "Southern Rock", difficulty: "Medium", bpm: 126, key: "D",
    skills: ["Barre chord control", "Rhythmic power", "Lead-in phrasing"] },
  { id: "jump", title: "Jump", artist: "Van Halen", genre: "Rock", difficulty: "Medium", bpm: 132, key: "A",
    skills: ["Power-chord muting", "Distinct attack", "Fast strumming"] },
  { id: "torn", title: "Torn", artist: "Natalie Imbruglia", genre: "Pop Rock", difficulty: "Medium", bpm: 106, key: "C",
    skills: ["Pop chord rhythm", "Accent control", "Smooth transitions"] },
  { id: "paradisecity", title: "Paradise City", artist: "Guns N' Roses", genre: "Hard Rock", difficulty: "Medium", bpm: 136, key: "D",
    skills: ["Riff timing", "Muting accuracy", "Strong downbeats"] },
  { id: "stayingalive", title: "Stayin' Alive", artist: "Bee Gees", genre: "Disco", difficulty: "Medium", bpm: 112, key: "F",
    skills: ["Groove consistency", "Syncopated accents", "Rhythmic precision"] },
  { id: "cheapthrills", title: "Cheap Thrills", artist: "Sia", genre: "Pop", difficulty: "Medium", bpm: 90, key: "A",
    skills: ["Simple pop rhythm", "Steady strumming", "Chord fluency"] },
  { id: "breathe", title: "Breathe", artist: "The Prodigy", genre: "Electronic Rock", difficulty: "Medium", bpm: 126, key: "D",
    skills: ["Syncopation", "Pulse control", "Percussive strums"] },
  { id: "foolsgold", title: "Fool's Gold", artist: "The Stone Roses", genre: "Indie Rock", difficulty: "Medium", bpm: 116, key: "A",
    skills: ["Accent shifts", "Mid-tempo groove", "Chord movement"] },
  { id: "sundaymorning", title: "Sunday Morning", artist: "Maroon 5", genre: "Pop Rock", difficulty: "Medium", bpm: 104, key: "Bb",
    skills: ["Chord transitions", "Pop rhythm", "Clean picking"] },
  { id: "anotherbrick", title: "Another Brick in the Wall", artist: "Pink Floyd", genre: "Progressive Rock", difficulty: "Medium", bpm: 108, key: "D",
    skills: ["Intro rhythm", "Accent control", "Barre stability"] },
  { id: "lustforlife", title: "Lust for Life", artist: "Iggy Pop", genre: "Rock", difficulty: "Medium", bpm: 124, key: "E",
    skills: ["Driving groove", "Aggressive muting", "Steady tempo"] },
  { id: "mygirl", title: "My Girl", artist: "The Temptations", genre: "Soul", difficulty: "Medium", bpm: 100, key: "F",
    skills: ["Simple groove", "Chord timing", "Vocal-led phrasing"] },
  { id: "everybreath", title: "Every Breath You Take", artist: "The Police", genre: "New Wave", difficulty: "Medium", bpm: 118, key: "D",
    skills: ["Rhythmic consistency", "Clean chord movement", "Subtle accents"] },
  { id: "standbyme", title: "Stand by Me", artist: "Ben E. King", genre: "Soul", difficulty: "Medium", bpm: 86, key: "C",
    skills: ["Simple groove", "Muted downstrokes", "Steady timing"] },
  { id: "somewhereonly", title: "Somewhere Only We Know", artist: "Keane", genre: "Pop Rock", difficulty: "Medium", bpm: 96, key: "Em",
    skills: ["Arpeggiated pattern", "Gentle dynamics", "Chord flow"] },
  { id: "gentle", title: "Gentle on My Mind", artist: "Glen Campbell", genre: "Country", difficulty: "Medium", bpm: 104, key: "G",
    skills: ["Country strumming", "Pick direction", "Warm phrasing"] },
  { id: "letitbe", title: "Let It Be", artist: "The Beatles", genre: "Soft Rock", difficulty: "Medium", bpm: 76, key: "C",
    skills: ["Slow chord transitions", "Gentle strumming", "Clear pulse"] },
  { id: "americanpie", title: "American Pie", artist: "Don McLean", genre: "Folk Rock", difficulty: "Medium", bpm: 104, key: "G",
    skills: ["Verse strumming", "Narrative phrasing", "Steady groove"] },
  { id: "thriller", title: "Thriller", artist: "Michael Jackson", genre: "Pop", difficulty: "Medium", bpm: 117, key: "D",
    skills: ["Sharp rhythm", "Accent control", "Groove locking"] },
  { id: "satisfaction", title: "Satisfaction", artist: "The Rolling Stones", genre: "Blues Rock", difficulty: "Medium", bpm: 110, key: "E",
    skills: ["Riff-based rhythm", "Muting", "Power chord drive"] },
  { id: "summerof69", title: "Summer of '69", artist: "Bryan Adams", genre: "Rock", difficulty: "Medium", bpm: 126, key: "D",
    skills: ["Open chord rhythm", "Fast changes", "Accent strength"] },
  { id: "blueberryhill", title: "Blueberry Hill", artist: "Fats Domino", genre: "Rock and Roll", difficulty: "Medium", bpm: 108, key: "G",
    skills: ["Simple groove", "Chord anchoring", "Relaxed swing"] },
  { id: "imagine", title: "Imagine", artist: "John Lennon", genre: "Soft Rock", difficulty: "Easy", bpm: 76, key: "C",
    skills: ["Open chord flow", "Gentle rhythm", "Easy transitions"] },
  { id: "allofme", title: "All of Me", artist: "John Legend", genre: "Soul", difficulty: "Easy", bpm: 96, key: "Ab",
    skills: ["Simple chord movement", "Warm tone", "Steady pulse"] },
  { id: "sevennation", title: "Seven Nation Army", artist: "The White Stripes", genre: "Rock", difficulty: "Easy", bpm: 124, key: "Em",
    skills: ["Riff accuracy", "Muting", "Pulse control"] },
  { id: "hollyday", title: "Holly Day", artist: "The Smashing Pumpkins", genre: "Alternative", difficulty: "Easy", bpm: 128, key: "D",
    skills: ["Short riffing", "Basic rhythm", "Accent control"] },
  { id: "wontbackdown", title: "Won't Back Down", artist: "Tom Petty", genre: "Rock", difficulty: "Easy", bpm: 112, key: "A",
    skills: ["Strumming consistency", "Easy progression", "Steady groove"] },
  { id: "billiejean", title: "Billie Jean", artist: "Michael Jackson", genre: "Pop", difficulty: "Easy", bpm: 117, key: "Dm",
    skills: ["Simple bass movement", "Rhythmic control", "Chord anchoring"] },
  { id: "bakerstreet", title: "Baker Street", artist: "Gerry Rafferty", genre: "Soft Rock", difficulty: "Easy", bpm: 96, key: "D",
    skills: ["Looping rhythm", "Accent flow", "Light picking"] },
  { id: "hohey", title: "Ho Hey", artist: "The Lumineers", genre: "Indie Folk", difficulty: "Easy", bpm: 100, key: "G",
    skills: ["Simple folk strum", "Steady groove", "Chord changes"] },
  { id: "cantstop", title: "Can't Stop", artist: "Red Hot Chili Peppers", genre: "Funk Rock", difficulty: "Easy", bpm: 132, key: "E",
    skills: ["Syncopated strumming", "Clean accents", "Tight rhythm"] },
  { id: "rosanna", title: "Rosanna", artist: "Toto", genre: "Pop Rock", difficulty: "Easy", bpm: 112, key: "F",
    skills: ["Groove-driven chords", "Clean timing", "Simple progression"] },
  { id: "everybodywants", title: "Everybody Wants to Rule the World", artist: "Tears for Fears", genre: "New Wave", difficulty: "Easy", bpm: 116, key: "C",
    skills: ["Basic chord pattern", "Steady groove", "Easy transitions"] },
  { id: "sweetdreams", title: "Sweet Dreams", artist: "Eurythmics", genre: "New Wave", difficulty: "Easy", bpm: 118, key: "A",
    skills: ["Simple rhythm", "Guitar texture", "Gentle accents"] },
  { id: "bananarama", title: "Cruel Summer", artist: "Bananarama", genre: "New Wave", difficulty: "Easy", bpm: 126, key: "Bm",
    skills: ["Constrained chord movement", "Pop groove", "Steady pulse"] },
  { id: "sweetchildofmine", title: "Sweet Child O' Mine", artist: "Guns N' Roses", genre: "Hard Rock", difficulty: "Easy", bpm: 126, key: "Dm",
    skills: ["Riff-based attack", "Muting control", "Faster transitions"] },
  { id: "commonpeople", title: "Common People", artist: "Pulp", genre: "Britpop", difficulty: "Easy", bpm: 118, key: "C",
    skills: ["Steady strumming", "Simple groove", "Chord flow"] },
  { id: "betweenus", title: "Between Us and the Moon", artist: "The Innocence Mission", genre: "Indie Folk", difficulty: "Easy", bpm: 92, key: "D",
    skills: ["Fingerpicked intro", "Calm pulse", "Gentle transitions"] },
  { id: "starlight", title: "Starlight", artist: "Muse", genre: "Alternative", difficulty: "Easy", bpm: 108, key: "E",
    skills: ["Simple chord motion", "Pulse control", "Bright strums"] },
  { id: "peoplearestrange", title: "People Are Strange", artist: "The Doors", genre: "Classic Rock", difficulty: "Easy", bpm: 100, key: "A",
    skills: ["Open chord phrasing", "Simple groove", "Steady end accents"] },
  { id: "hangon", title: "Hang On Sloopy", artist: "The McCoys", genre: "Garage Rock", difficulty: "Easy", bpm: 128, key: "E",
    skills: ["Punchy open chords", "Fast change timing", "Simple riffing"] },
  { id: "frenchmaid", title: "French Maid", artist: "The Kinks", genre: "Rock", difficulty: "Easy", bpm: 116, key: "D",
    skills: ["Basic strumming", "Swinging groove", "Directive chord changes"] },
  { id: "houseofrising", title: "House of the Rising Sun", artist: "The Animals", genre: "Folk Rock", difficulty: "Easy", bpm: 96, key: "Am",
    skills: ["Slow fingerpicking", "Open chord motion", "Steady pulse"] },
  { id: "smalltown", title: "Small Town", artist: "John Mellencamp", genre: "Heartland Rock", difficulty: "Easy", bpm: 112, key: "D",
    skills: ["Straight rhythm", "Accessible changes", "Simple groove"] },
  { id: "yourebeautiful", title: "You're Beautiful", artist: "James Blunt", genre: "Pop", difficulty: "Easy", bpm: 96, key: "D",
    skills: ["Gentle strumming", "Simple changes", "Warm phrasing"] },
  { id: "maggie", title: "Maggie May", artist: "Rod Stewart", genre: "Rock", difficulty: "Easy", bpm: 108, key: "G",
    skills: ["Basic riffing", "Steady strums", "Easy transitions"] },
  { id: "allstar", title: "All Star", artist: "Smash Mouth", genre: "Pop Rock", difficulty: "Easy", bpm: 108, key: "D",
    skills: ["Punchy strumming", "Simple groove", "Riff-based rhythm"] },
  { id: "liveforever", title: "Live Forever", artist: "Oasis", genre: "Britpop", difficulty: "Easy", bpm: 116, key: "G",
    skills: ["Simple chord flow", "Straight rhythm", "Easy transitions"] },
  { id: "iwillfollowyou", title: "I Will Follow You Into the Dark", artist: "Death Cab for Cutie", genre: "Indie Folk", difficulty: "Easy", bpm: 84, key: "Dm",
    skills: ["Fingerstyle calm", "Slow changes", "Gentle dynamics"] },
  { id: "kidcharlemagne", title: "Kid Charlemagne", artist: "Steely Dan", genre: "Jazz Rock", difficulty: "Medium", bpm: 122, key: "Bb",
    skills: ["Syncopated groove", "Chord movement", "Rhythmic confidence"] },
  { id: "tuesdaymorning", title: "Tuesday Morning", artist: "The Muffs", genre: "Alternative", difficulty: "Medium", bpm: 116, key: "A",
    skills: ["Alternative accents", "Tight rhythm", "Barre stability"] },
  { id: "dancingqueen", title: "Dancing Queen", artist: "ABBA", genre: "Pop", difficulty: "Medium", bpm: 100, key: "A",
    skills: ["Groove-focused strumming", "Chord timing", "Bright accents"] },
  { id: "masterofpuppets", title: "Master of Puppets", artist: "Metallica", genre: "Thrash Metal", difficulty: "Hard", bpm: 180, key: "E",
    skills: ["Fast picking", "Precise muting", "High-speed shifts"] },
  { id: "thechain", title: "The Chain", artist: "Fleetwood Mac", genre: "Classic Rock", difficulty: "Hard", bpm: 128, key: "Am",
    skills: ["Complex rhythm", "Barre control", "Dynamic transitions"] },
  { id: "walkthisway", title: "Walk This Way", artist: "Run-D.M.C.", genre: "Rap Rock", difficulty: "Hard", bpm: 144, key: "E",
    skills: ["Rhythmic phrasing", "Muting control", "Sharp accents"] },
  { id: "badcompany", title: "Bad Company", artist: "Bad Company", genre: "Classic Rock", difficulty: "Hard", bpm: 132, key: "D",
    skills: ["Power chord drive", "Syncopated feel", "High-energy transitions"] },
  { id: "blackhole", title: "Black Hole Sun", artist: "Soundgarden", genre: "Grunge", difficulty: "Hard", bpm: 120, key: "D",
    skills: ["Barre chord control", "Alternate picking", "Dynamic texture"] },
  { id: "wholelottalove", title: "Whole Lotta Love", artist: "Led Zeppelin", genre: "Classic Rock", difficulty: "Hard", bpm: 136, key: "D",
    skills: ["Riff persistence", "Palm muting", "Aggressive timing"] },
  { id: "killingme", title: "Killing Me Softly", artist: "Roberta Flack", genre: "Soul", difficulty: "Hard", bpm: 88, key: "Fm",
    skills: ["Fingerstyle control", "Textural dynamics", "Chord voicing"] },
  { id: "herecomesthesun", title: "Here Comes the Sun", artist: "The Beatles", genre: "Pop", difficulty: "Hard", bpm: 128, key: "A",
    skills: ["Arpeggio accuracy", "Cross-string phrasing", "Warm dynamics"] },
  { id: "bohemianrhapsody", title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock", difficulty: "Hard", bpm: 112, key: "Bb",
    skills: ["Section changes", "Dynamic control", "Complex rhythm"] },
  { id: "eleanor", title: "Eleanor Rigby", artist: "The Beatles", genre: "Baroque Pop", difficulty: "Hard", bpm: 88, key: "C",
    skills: ["Fingerpicked pattern", "Inversion control", "Delicate timing"] },
  { id: "smooth", title: "Smooth", artist: "Santana", genre: "Latin Rock", difficulty: "Hard", bpm: 116, key: "Am",
    skills: ["Latin rhythm", "Syncopated accents", "Fingerstyle groove"] },
  { id: "underpressure", title: "Under Pressure", artist: "Queen & David Bowie", genre: "Rock", difficulty: "Hard", bpm: 120, key: "Dm",
    skills: ["Bass-led rhythm", "Tight muting", "Dynamic shaping"] },
  { id: "yourbodyisawonderland", title: "Your Body Is a Wonderland", artist: "John Mayer", genre: "Acoustic Pop", difficulty: "Hard", bpm: 92, key: "C",
    skills: ["Fingerstyle polish", "Chord voicing control", "Expressive pacing"] },
  { id: "fastcar", title: "Fast Car", artist: "Tracy Chapman", genre: "Folk Rock", difficulty: "Hard", bpm: 100, key: "G",
    skills: ["Accent-driven groove", "Fingerpicking flow", "Dynamic depth"] },
  { id: "backintime", title: "Back in Time", artist: "Huey Lewis", genre: "Pop Rock", difficulty: "Hard", bpm: 128, key: "A",
    skills: ["Rhythmic drive", "Clean transitions", "Shaped attack"] },
  { id: "jessiesgirl", title: "Jessie's Girl", artist: "Rick Springfield", genre: "New Wave", difficulty: "Hard", bpm: 132, key: "D",
    skills: ["Sharp jabs", "Chord muting", "Driving rhythm"] },
  { id: "majestic", title: "Majestic", artist: "The Muppet", genre: "Comedy", difficulty: "Easy", bpm: 100, key: "C",
    skills: ["Simple shapes", "Easy groove", "Gentle timing"] },
];

/* ---------------------------------- Audio helpers ---------------------------------- */
const NOTE_INDEX: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

function noteFreq(noteName: string, octave: number): number {
  const semitone = NOTE_INDEX[noteName];
  const n = semitone + (octave - 4) * 12 - 9;
  return 440 * Math.pow(2, n / 12);
}

const QUALITY_INTERVALS: Record<string, number[]> = {
  "": [0, 4, 7], maj: [0, 4, 7], m: [0, 3, 7], min: [0, 3, 7],
  "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], min7: [0, 3, 7, 10],
  sus4: [0, 5, 7], sus2: [0, 2, 7], dim: [0, 3, 6], aug: [0, 4, 8],
};

function parseChord(raw: string): Chord | null {
  const str = raw.trim();
  const m = str.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!m) return null;
  const root = m[1].toUpperCase() + m[2];
  const rootKey = NOTE_INDEX[root] !== undefined ? root : m[1].toUpperCase();
  if (NOTE_INDEX[rootKey] === undefined) return null;
  const qualityRaw = m[3].trim();
  const quality = QUALITY_INTERVALS[qualityRaw]
    ? qualityRaw
    : qualityRaw.toLowerCase().startsWith("m") && !qualityRaw.toLowerCase().startsWith("maj")
    ? "m"
    : "";
  const intervals = QUALITY_INTERVALS[quality] || QUALITY_INTERVALS[qualityRaw] || [0, 4, 7];
  return { root: rootKey, intervals, label: str };
}

function chordFrequencies(chord: Chord, baseOctave = 3): number[] {
  const rootIdx = NOTE_INDEX[chord.root];
  return chord.intervals.map((iv) => {
    const total = rootIdx + iv;
    const octaveShift = Math.floor(total / 12);
    const semitone = total % 12;
    const noteName =
      Object.keys(NOTE_INDEX).find((k) => NOTE_INDEX[k] === semitone && k.length <= 2 && !k.includes("b")) ||
      chord.root;
    return noteFreq(noteName, baseOctave + octaveShift);
  });
}

/* ---------------------------------- Small UI atoms ---------------------------------- */
function Pill({ children, tone = "amber" }: { children: React.ReactNode; tone?: "amber" | "teal" | "coral" }) {
  const bg = tone === "coral" ? COLORS.coral : tone === "teal" ? COLORS.teal : COLORS.amber;
  return (
    <span
      style={{
        display: "inline-block", padding: "3px 10px", borderRadius: 999,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.04em", color: COLORS.bg, background: bg,
      }}
    >
      {children}
    </span>
  );
}

function FretDivider() {
  return (
    <div
      style={{
        height: 2, width: "100%",
        background: `repeating-linear-gradient(90deg, ${COLORS.amber}55 0 8px, transparent 8px 16px)`,
      }}
    />
  );
}

function getPreviewProgression(song: Song): string[] {
  const normalizedKey = (song.key || "C").replace(/m$/, "").replace(/maj$/, "");
  const key = normalizedKey === "F#" ? "F#" : normalizedKey === "C#" ? "C#" : normalizedKey;

  const map: Record<string, string[]> = {
    C: ["C", "G", "Am", "F"],
    G: ["G", "D", "Em", "C"],
    D: ["D", "A", "Bm", "G"],
    A: ["A", "E", "F#m", "D"],
    E: ["E", "B", "C#m", "A"],
    F: ["F", "C", "Dm", "Bb"],
    B: ["B", "F#", "G#m", "E"],
    "C#": ["C#", "G#", "A#m", "D#"],
    "F#": ["F#", "C#", "D#m", "A#"],
    Am: ["Am", "F", "G", "Em"],
    Em: ["Em", "C", "G", "D"],
    Dm: ["Dm", "Am", "C", "F"],
    Bm: ["Bm", "F#", "G", "D"],
  };

  return map[key] || ["C", "G", "Am", "F"];
}

/* ---------------------------------- Tab: Search Songs ---------------------------------- */
function SearchTab({
  progress,
  onPreviewSong,
}: {
  progress: Progress;
  onPreviewSong: (song: Song) => void;
}) {
  const [query, setQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState<"All" | Difficulty>("All");

  const filtered = SONGS.filter((s) => {
    const matchesQuery = (s.title + s.artist).toLowerCase().includes(query.toLowerCase());
    const matchesDiff = diffFilter === "All" || s.difficulty === diffFilter;
    return matchesQuery && matchesDiff;
  }).sort((a, b) => {
    const titleCompare = a.title.localeCompare(b.title);
    return titleCompare !== 0 ? titleCompare : a.artist.localeCompare(b.artist);
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs or artists…"
          style={{
            flex: "1 1 260px", padding: "12px 16px", borderRadius: 10,
            border: `1px solid ${COLORS.woodLight}`, background: COLORS.bgSoft, color: COLORS.cream,
            fontFamily: "Inter, sans-serif", fontSize: 15, outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              style={{
                padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13,
                background: diffFilter === d ? COLORS.amber : COLORS.wood,
                color: diffFilter === d ? COLORS.bg : COLORS.creamDim,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
        {filtered.map((s) => {
          const done = progress.completed.includes(s.id);
          return (
            <div
              key={s.id}
              style={{
                background: COLORS.wood, borderRadius: 14, padding: 20,
                border: `1px solid ${done ? COLORS.teal + "66" : COLORS.woodLight}`,
                position: "relative", overflow: "hidden",
              }}
            >
              {done && <div style={{ position: "absolute", top: 14, right: 14, color: COLORS.teal, fontSize: 20 }}>✓</div>}
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: COLORS.cream, marginBottom: 2 }}>
                {s.title}
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.creamDim, marginBottom: 12 }}>
                {s.artist} · {s.genre} · {s.bpm} BPM
              </div>
              <div style={{ marginBottom: 14 }}>
                <Pill tone={s.difficulty === "Hard" ? "coral" : s.difficulty === "Medium" ? "amber" : "teal"}>
                  {s.difficulty.toUpperCase()}
                </Pill>
              </div>
              <FretDivider />
              <div style={{ marginTop: 12, fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.creamDim, fontWeight: 600, marginBottom: 6 }}>
                SKILLS REQUIRED
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.cream, lineHeight: 1.7 }}>
                {s.skills.map((sk) => (
                  <li key={sk}>{sk}</li>
                ))}
              </ul>
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                
                  href={buildSongVideoUrl(s)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "7px 10px", borderRadius: 999, border: `1px solid ${COLORS.amber}`,
                    background: COLORS.amber + "16", color: COLORS.amberSoft,
                    fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  🎬 Official video
                </a>
                
                  href={buildSongTabUrl(s)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    color: COLORS.amberSoft,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  Open guitar tab
                </a>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ color: COLORS.creamDim, fontFamily: "Inter, sans-serif" }}>No songs match — try a different search.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Tab: Learning Path ---------------------------------- */
function pickPrerequisites(hardSong: Song): Song[] {
  const scored = SONGS.filter((s) => s.id !== hardSong.id && s.difficulty !== "Hard")
    .map((s) => {
      const overlap = s.skills.filter((sk) =>
        hardSong.skills.some((hs) => hs.toLowerCase().includes(sk.toLowerCase().split(" ")[0]) || sk === hs)
      ).length;
      const genreBonus = s.genre === hardSong.genre ? 0.5 : 0;
      return { song: s, score: overlap + genreBonus };
    })
    .sort((a, b) => b.score - a.score);

  const easy = scored.find((x) => x.song.difficulty === "Easy");
  const rest = scored.filter((x) => !easy || x.song.id !== easy.song.id);
  const picks: Song[] = [];
  if (easy) picks.push(easy.song);
  for (const r of rest) {
    if (picks.length >= 3) break;
    if (!picks.find((p) => p.id === r.song.id)) picks.push(r.song);
  }
  return picks.slice(0, 3);
}

function LearningPathTab({
  progress,
  onOpenPractice,
  onPreviewSong,
}: {
  progress: Progress;
  onOpenPractice: (song: Song) => void;
  onPreviewSong: (song: Song) => void;
}) {
  const hardSongs = SONGS.filter((s) => s.difficulty === "Hard").sort((a, b) => a.title.localeCompare(b.title));
  const [targetId, setTargetId] = useState(hardSongs[0].id);
  const target = SONGS.find((s) => s.id === targetId)!;
  const prereqs = useMemo(() => pickPrerequisites(target), [targetId]);

  const prereqsDone = prereqs.every((p) => progress.completed.includes(p.id));
  const xp = progress.xp;
  const level = Math.floor(xp / 100) + 1;
  const xpIntoLevel = xp % 100;

  return (
    <div>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 16, background: COLORS.wood,
          borderRadius: 14, padding: "16px 20px", marginBottom: 26, flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 52, height: 52, borderRadius: "50%",
            background: `conic-gradient(${COLORS.amber} ${xpIntoLevel * 3.6}deg, ${COLORS.woodLight} 0deg)`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 42, height: 42, borderRadius: "50%", background: COLORS.wood,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Fraunces', serif", fontWeight: 700, color: COLORS.amber, fontSize: 16,
            }}
          >
            {level}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.creamDim, marginBottom: 4 }}>
            Level {level} guitarist · {xp} XP earned
          </div>
          <div style={{ height: 8, borderRadius: 999, background: COLORS.woodLight, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${xpIntoLevel}%`, background: COLORS.amber, borderRadius: 999 }} />
          </div>
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.creamDim }}>
          🔥 {progress.completed.length} song{progress.completed.length === 1 ? "" : "s"} completed
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.creamDim, fontWeight: 600 }}>
          CHOOSE YOUR TARGET (HARD) SONG
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {hardSongs.map((s) => (
            <button
              key={s.id}
              onClick={() => setTargetId(s.id)}
              style={{
                padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                border: `1px solid ${targetId === s.id ? COLORS.coral : COLORS.woodLight}`,
                background: targetId === s.id ? COLORS.coral + "22" : COLORS.wood,
                color: COLORS.cream, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13,
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: COLORS.wood, borderRadius: 16, padding: "26px 20px 30px", position: "relative" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: COLORS.cream, marginBottom: 4 }}>
          Path to "{target.title}"
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.creamDim, marginBottom: 26 }}>
          Three stepping stone songs to build the exact skills this target song needs, in order.
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 0, position: "relative" }}>
          <div style={{ position: "absolute", left: 24, right: 24, top: 34, height: 3, background: COLORS.amber + "55", zIndex: 0 }} />
          {prereqs.map((p, i) => {
            const done = progress.completed.includes(p.id);
            return (
              <div key={p.id} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 1 }}>
                <div
                  data-click-sound="true"
                  onClick={() => onOpenPractice(p)}
                  style={{
                    width: 68, height: 68, borderRadius: "50%", margin: "0 auto 12px", position: "relative",
                    background: done ? COLORS.teal : COLORS.bgSoft,
                    border: `3px solid ${done ? COLORS.teal : COLORS.amber}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22,
                    color: done ? COLORS.bg : COLORS.amber, cursor: "pointer",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.cream }}>{p.title}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.creamDim, marginBottom: 8 }}>{p.artist}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: COLORS.amberSoft, marginBottom: 8 }}>{p.skills[0]}</div>
                
                  href={buildSongVideoUrl(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "6px 10px", borderRadius: 999, border: `1px solid ${COLORS.amber}`,
                    background: COLORS.amber + "16", color: COLORS.amberSoft,
                    fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  🎬 Official video
                </a>
              </div>
            );
          })}

          <div style={{ flex: 1.2, textAlign: "center", position: "relative", zIndex: 1 }}>
            <div
              data-click-sound="true"
              style={{
                width: 84, height: 84, borderRadius: "50%", margin: "0 auto 12px",
                background: prereqsDone ? COLORS.coral + "22" : COLORS.bgSoft,
                border: `3px solid ${COLORS.coral}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30, cursor: prereqsDone ? "pointer" : "default",
                filter: prereqsDone ? "none" : "grayscale(0.4) opacity(0.7)",
              }}
              onClick={() => prereqsDone && onOpenPractice(target)}
            >
              {prereqsDone ? "🎸" : "🔒"}
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: COLORS.cream }}>{target.title}</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.creamDim, marginBottom: 10 }}>
              {prereqsDone ? "Unlocked — go for it!" : "Unlocks after the 3 songs above"}
            </div>
            
              href={buildSongVideoUrl(target)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "7px 10px", borderRadius: 999, border: `1px solid ${COLORS.amber}`,
                background: COLORS.amber + "16", color: COLORS.amberSoft,
                fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer",
                textDecoration: "none",
              }}
            >
              🎬 Official video
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Tab: Backing Tracks ---------------------------------- */
const PRESETS: { name: string; chords: string[] }[] = [
  { name: "Pop I–V–vi–IV (C)", chords: ["C", "G", "Am", "F"] },
  { name: "Jazz ii–V–I (Bb)", chords: ["Cm7", "F7", "Bbmaj7"] },
  { name: "12-Bar Blues (E)", chords: ["E7", "E7", "E7", "E7", "A7", "A7", "E7", "E7", "B7", "A7", "E7", "B7"] },
  { name: "Classic I–IV–V (G)", chords: ["G", "C", "D"] },
  { name: "Minor Vamp (Em)", chords: ["Em", "C", "G", "D"] },
];

type Style = "Pop" | "Rock" | "Jazz" | "Blues";

function BackingTracksTab() {
  const [chordsText, setChordsText] = useState(PRESETS[0].chords.join(", "));
  const [bpm, setBpm] = useState(96);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [style, setStyle] = useState<Style>("Pop");
  const [playing, setPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopFlagRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const styleWave: OscillatorType =
    style === "Pop" ? "triangle" : style === "Rock" ? "sawtooth" : style === "Jazz" ? "sine" : "square";

  const parsedChords = useMemo(() => {
    return chordsText.split(",").map((c) => parseChord(c)).filter((c): c is Chord => c !== null);
  }, [chordsText]);

  const stop = useCallback(() => {
    stopFlagRef.current = true;
    setPlaying(false);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
  }, []);

  const schedulePattern = useCallback((ctx: AudioContext, startTime: number) => {
    const secPerBeat = 60 / bpm;
    const chordDur = secPerBeat * beatsPerChord;
    let t = startTime;

    const masterGain = ctx.createGain();
    masterGain.gain.value = style === "Rock" ? 0.24 : style === "Blues" ? 0.22 : style === "Jazz" ? 0.24 : 0.24;
    masterGain.connect(ctx.destination);

    const drumGain = ctx.createGain();
    drumGain.gain.value = style === "Rock" ? 0.28 : style === "Blues" ? 0.24 : style === "Jazz" ? 0.22 : 0.24;
    drumGain.connect(ctx.destination);

    parsedChords.forEach((chord) => {
      const freqs = chordFrequencies(chord, 3);
      const bassFreq = freqs[0] / 2;

      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = style === "Rock" ? "sawtooth" : style === "Blues" ? "triangle" : style === "Jazz" ? "sine" : "triangle";
      bassOsc.frequency.value = bassFreq;
      bassGain.gain.setValueAtTime(0, t);
      bassGain.gain.linearRampToValueAtTime(style === "Rock" ? 0.42 : style === "Blues" ? 0.32 : style === "Jazz" ? 0.2 : 0.36, t + 0.025);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + chordDur * (style === "Rock" ? 0.84 : style === "Blues" ? 0.9 : style === "Jazz" ? 0.96 : 0.88));
      bassOsc.connect(bassGain).connect(masterGain);
      bassOsc.start(t);
      bassOsc.stop(t + chordDur);

      const strokes = [0, chordDur / 2];
      strokes.forEach((strokeOffset) => {
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = style === "Rock" ? "sawtooth" : style === "Blues" ? "square" : style === "Jazz" ? "sine" : "triangle";
          osc.frequency.value = f;
          const startT = t + strokeOffset + idx * 0.01;
          const dur = chordDur / 2 - idx * 0.01;
          g.gain.setValueAtTime(0, startT);
          g.gain.linearRampToValueAtTime(style === "Rock" ? 0.2 : style === "Blues" ? 0.17 : style === "Jazz" ? 0.12 : 0.16, startT + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, startT + dur * (style === "Rock" ? 0.92 : style === "Blues" ? 0.94 : style === "Jazz" ? 0.98 : 0.95));
          osc.connect(g).connect(masterGain);
          osc.start(startT);
          osc.stop(startT + dur);
        });
      });

      const snareOsc = ctx.createOscillator();
      const snareGain = ctx.createGain();
      snareOsc.type = style === "Rock" ? "sawtooth" : "triangle";
      snareOsc.frequency.setValueAtTime(style === "Rock" ? 260 : 180, t + chordDur / 2);
      snareOsc.frequency.exponentialRampToValueAtTime(style === "Rock" ? 120 : 80, t + chordDur / 2 + 0.08);
      snareGain.gain.setValueAtTime(0.0001, t + chordDur / 2);
      snareGain.gain.linearRampToValueAtTime(style === "Rock" ? 0.2 : style === "Blues" ? 0.16 : style === "Jazz" ? 0.11 : 0.15, t + chordDur / 2 + 0.01);
      snareGain.gain.exponentialRampToValueAtTime(0.0001, t + chordDur / 2 + 0.1);
      snareOsc.connect(snareGain).connect(drumGain);
      snareOsc.start(t + chordDur / 2);
      snareOsc.stop(t + chordDur / 2 + 0.11);

      const eighthNote = secPerBeat / 2;
      for (let step = 0; step < beatsPerChord * 2; step += 1) {
        const hitTime = t + step * eighthNote;
        const hatOsc = ctx.createOscillator();
        const hatGain = ctx.createGain();
        hatOsc.type = "square";
        hatOsc.frequency.setValueAtTime(style === "Rock" ? 2200 : style === "Blues" ? 1500 : style === "Jazz" ? 1200 : 1800, hitTime);
        hatOsc.frequency.exponentialRampToValueAtTime(style === "Rock" ? 700 : style === "Blues" ? 500 : style === "Jazz" ? 400 : 600, hitTime + 0.04);
        hatGain.gain.setValueAtTime(0.0001, hitTime);
        hatGain.gain.linearRampToValueAtTime(style === "Rock" ? 0.07 : style === "Blues" ? 0.05 : style === "Jazz" ? 0.04 : 0.05, hitTime + 0.002);
        hatGain.gain.exponentialRampToValueAtTime(0.0001, hitTime + 0.04);
        hatOsc.connect(hatGain).connect(drumGain);
        hatOsc.start(hitTime);
        hatOsc.stop(hitTime + 0.045);
      }

      t += chordDur;
    });

    return Math.max(0.05, t - startTime);
  }, [parsedChords, bpm, beatsPerChord, style, styleWave]);

  const play = useCallback(() => {
    if (parsedChords.length === 0) return;

    if (ctxRef.current) {
      stop();
    }

    stopFlagRef.current = false;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctxRef.current = ctx;
    setPlaying(true);

    const startTime = ctx.currentTime + 0.02;
    const totalDurationSeconds = schedulePattern(ctx, startTime);

    const loopPlayback = () => {
      if (stopFlagRef.current || !loopEnabled || !ctxRef.current || ctxRef.current !== ctx) {
        setPlaying(false);
        return;
      }

      const nextStart = ctx.currentTime + 0.001;
      schedulePattern(ctx, nextStart);
      timeoutRef.current = window.setTimeout(loopPlayback, totalDurationSeconds * 1000 - 10);
    };

    if (loopEnabled) {
      timeoutRef.current = window.setTimeout(loopPlayback, totalDurationSeconds * 1000 - 10);
    } else {
      timeoutRef.current = window.setTimeout(() => {
        if (!stopFlagRef.current) setPlaying(false);
      }, totalDurationSeconds * 1000);
    }
  }, [parsedChords, schedulePattern, stop, loopEnabled]);

  useEffect(() => () => stop(), [stop]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ background: COLORS.wood, borderRadius: 16, padding: 24 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.creamDim, marginBottom: 8 }}>
            CHORD PROGRESSION (comma-separated — try C, G, Am, F)
          </div>
          <input
            value={chordsText}
            onChange={(e) => setChordsText(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10,
              border: `1px solid ${COLORS.woodLight}`, background: COLORS.bgSoft, color: COLORS.teal,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 15, outline: "none", marginBottom: 18,
            }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setChordsText(p.chords.join(", "))}
                style={{
                  padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.woodLight}`,
                  background: COLORS.bgSoft, color: COLORS.creamDim, fontFamily: "Inter, sans-serif",
                  fontSize: 12, cursor: "pointer",
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 22 }}>
            <div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.creamDim, marginBottom: 6 }}>
                TEMPO — {bpm} BPM
              </div>
              <input
                type="range"
                min={50}
                max={180}
                value={bpm}
                onChange={(e) => setBpm(+e.target.value)}
                style={{ width: 180, accentColor: COLORS.teal }}
              />
            </div>
            <div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.creamDim, marginBottom: 6 }}>
                BEATS PER CHORD
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[2, 4].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBeatsPerChord(b)}
                    style={{
                      padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                      border: `1px solid ${beatsPerChord === b ? COLORS.teal : COLORS.woodLight}`,
                      background: beatsPerChord === b ? COLORS.teal + "22" : COLORS.bgSoft, color: COLORS.cream,
                      fontFamily: "Inter, sans-serif", fontSize: 13,
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.creamDim, marginBottom: 6 }}>
                STYLE / TONE
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["Pop", "Rock", "Jazz", "Blues"] as Style[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    style={{
                      padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                      border: `1px solid ${style === s ? COLORS.teal : COLORS.woodLight}`,
                      background: style === s ? COLORS.teal + "22" : COLORS.bgSoft, color: COLORS.cream,
                      fontFamily: "Inter, sans-serif", fontSize: 13,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
            <button
              onClick={() => setLoopEnabled((value) => !value)}
              style={{
                padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.woodLight}`,
                background: loopEnabled ? COLORS.amber + "22" : COLORS.bgSoft, color: COLORS.cream,
                fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              {loopEnabled ? "🔁 Loop On" : "↺ Loop Off"}
            </button>
            <button
              onClick={playing ? stop : play}
              style={{
                padding: "14px 28px", borderRadius: 12, border: "none", cursor: "pointer",
                background: playing ? COLORS.coral : COLORS.teal, color: COLORS.bg,
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15,
              }}
            >
              {playing ? "■ Stop" : "▶ Play Backing Track"}
            </button>
          </div>

        </div>

        <div style={{ background: COLORS.wood, borderRadius: 16, padding: 24 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.creamDim, marginBottom: 12 }}>
            PARSED CHORDS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {parsedChords.map((c, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14,
                  color: COLORS.bg, background: COLORS.amber, padding: "6px 12px", borderRadius: 8,
                }}
              >
                {c.label}
              </span>
            ))}
            {parsedChords.length === 0 && (
              <div style={{ color: COLORS.coral, fontFamily: "Inter, sans-serif", fontSize: 13 }}>
                No valid chords recognized yet.
              </div>
            )}
          </div>
          <div style={{ marginTop: 22, fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.creamDim, lineHeight: 1.7 }}>
            Supports major, minor (m), 7, maj7, m7, sus2, sus4, dim, aug — e.g.{" "}
            <span style={{ color: COLORS.amberSoft }}>Bm7</span>, <span style={{ color: COLORS.amberSoft }}>F#dim</span>,{" "}
            <span style={{ color: COLORS.amberSoft }}>Csus4</span>.
          </div>
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, background: COLORS.bgSoft, border: `1px solid ${COLORS.woodLight}`, color: COLORS.creamDim, fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.6 }}>
            Use this customizable backing track to practice improvising solos as well as working on written ones. Have fun!
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Practice / Video-check modal ---------------------------------- */
function buildSongTabUrl(song: Song) {
  const query = `${song.title} ${song.artist}`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(`${query} guitar tab`)}`;
}

function buildSongVideoUrl(song: Song) {
  const query = `${song.title} ${song.artist} official music video`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function PracticeModal({
  song,
  onClose,
  onPass,
}: {
  song: Song;
  onClose: () => void;
  onPass: (song: Song, score: number) => void;
}) {
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setVideoURL(URL.createObjectURL(file));
  };

  const analyze = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    setAnalyzing(true);
    setResult(null);

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = ctx.createMediaElementSource(videoEl);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const data = new Uint8Array(analyser.fftSize);

    const rmsValues: number[] = [];
    let onsetCount = 0;
    let prevRms = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSquares += v * v;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      rmsValues.push(rms);
      if (rms - prevRms > 0.05 && rms > 0.06) onsetCount++;
      prevRms = rms;
      if (!videoEl.paused && !videoEl.ended) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    videoEl.currentTime = 0;
    videoEl.play();
    rafRef.current = requestAnimationFrame(tick);

    videoEl.onended = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.close();

      const duration = videoEl.duration || 1;
      const avgRms = rmsValues.reduce((a, b) => a + b, 0) / (rmsValues.length || 1);
      const silentFrames = rmsValues.filter((r) => r < 0.02).length;
      const coverage = 1 - silentFrames / (rmsValues.length || 1);

      const expectedOnsets = (song.bpm / 60) * duration * 0.9;
      const onsetRatio = Math.min(onsetCount / Math.max(expectedOnsets, 1), expectedOnsets / Math.max(onsetCount, 1));

      const coverageScore = Math.min(coverage / 0.7, 1) * 100;
      const dynamicsScore = Math.min(avgRms / 0.12, 1) * 100;
      const rhythmScore = onsetRatio * 100;

      const finalScore = Math.round(0.4 * coverageScore + 0.3 * dynamicsScore + 0.3 * rhythmScore);
      const clamped = Math.max(5, Math.min(99, finalScore));
      setResult(clamped);
      setAnalyzing(false);
      if (clamped >= 70) onPass(song, clamped);
    };
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#0009", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.wood, borderRadius: 18, padding: 28, maxWidth: 480, width: "100%",
          border: `1px solid ${COLORS.woodLight}`,
        }}
      >
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: COLORS.cream, marginBottom: 4 }}>
          Practice check · {song.title}
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.creamDim, marginBottom: 18 }}>
          Upload a video of yourself playing this song. Score ≥ 70 marks it complete.
        </div>

        <input
          type="file"
          accept="video/*"
          onChange={handleFile}
          style={{ color: COLORS.creamDim, fontFamily: "Inter, sans-serif", fontSize: 13, marginBottom: 8 }}
        />

        <div style={{ marginBottom: 14 }}>
          
            href={buildSongTabUrl(song)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: COLORS.amberSoft,
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Open guitar tab for {song.title}
          </a>
        </div>

        {videoURL && (
          <video
            ref={videoRef}
            src={videoURL}
            controls
            style={{ width: "100%", borderRadius: 10, marginBottom: 14, background: "#000" }}
            crossOrigin="anonymous"
          />
        )}

        {videoURL && (
          <button
            disabled={analyzing}
            onClick={analyze}
            style={{
              padding: "12px 22px", borderRadius: 10, border: "none", cursor: analyzing ? "default" : "pointer",
              background: COLORS.amber, color: COLORS.bg, fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
              opacity: analyzing ? 0.6 : 1,
            }}
          >
            {analyzing ? "Analyzing while it plays…" : "Analyze performance"}
          </button>
        )}

        {result !== null && (
          <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: COLORS.bgSoft }}>
            <div
              style={{
                fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700,
                color: result >= 70 ? COLORS.teal : COLORS.coral,
              }}
            >
              {result}%
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.creamDim, marginTop: 4 }}>
              {result >= 70
                ? "Nice — that's marked complete and XP is added."
                : "Not quite there — check timing and try to play through with fewer pauses, then try again."}
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: COLORS.creamDim, marginTop: 10, opacity: 0.8 }}>
              Score reflects playing coverage, dynamic consistency, and rhythmic density detected from your audio —
              it's a practice-consistency signal, not exact note-by-note grading.
            </div>
          </div>
        )}

        <div style={{ textAlign: "right", marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px", borderRadius: 8, border: `1px solid ${COLORS.woodLight}`,
              background: "transparent", color: COLORS.creamDim, fontFamily: "Inter, sans-serif", cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Root Page ---------------------------------- */
type TabId = "search" | "path" | "backing";

function GuitarAccent() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
        background: `radial-gradient(circle at top left, ${COLORS.magenta}22 0, transparent 28%), radial-gradient(circle at 85% 12%, ${COLORS.teal}18 0, transparent 24%), linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.bgSoft} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute", right: -18, bottom: -24, width: 210, height: 210,
          borderRadius: "50%", border: `2px solid ${COLORS.amber}33`, opacity: 0.9,
          transform: "rotate(-12deg)",
        }}
      />
      <div
        style={{
          position: "absolute", right: 24, bottom: 20, fontSize: 120, opacity: 0.16,
          color: COLORS.amberSoft, fontFamily: "'Fraunces', serif",
        }}
      >
        ♪
      </div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState<TabId>("search");
  const [progress, setProgress] = useState<Progress>({ completed: [], xp: 0 });
  const [practiceSong, setPracticeSong] = useState<Song | null>(null);
  const [celebrate, setCelebrate] = useState<{ song: Song; score: number } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const playClickSound = useCallback(() => {
    if (typeof window === "undefined") return;

    const AudioCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const context = audioContextRef.current ?? new AudioCtor();
    audioContextRef.current = context;

    if (context.state === "suspended") {
      void context.resume();
    }

    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.03);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.025, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }, []);

  const handleInteractiveClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    const interactive = target?.closest("button, a, [data-click-sound='true']");
    if (interactive) {
      playClickSound();
    }
  }, [playClickSound]);

  const handlePreviewSong = useCallback((song: Song) => {
    window.open(buildSongVideoUrl(song), "_blank", "noopener,noreferrer");
  }, []);

  const handlePass = (song: Song, score: number) => {
    setProgress((p) => {
      if (p.completed.includes(song.id)) return p;
      return {
        completed: [...p.completed, song.id],
        xp: p.xp + (song.difficulty === "Hard" ? 60 : song.difficulty === "Medium" ? 35 : 20),
      };
    });
    setCelebrate({ song, score });
    setTimeout(() => setCelebrate(null), 3200);
  };

  const TABS: { id: TabId; label: string }[] = [
    { id: "search", label: "Search Songs" },
    { id: "path", label: "Learning Path" },
    { id: "backing", label: "Backing Tracks" },
  ];

  return (
    <div
      style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "Inter, sans-serif", position: "relative" }}
      onClickCapture={handleInteractiveClick}
    >
      <GuitarAccent />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 20px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color: COLORS.cream }}>
            Song<span style={{ color: COLORS.amber }}>Quest</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.creamDim, padding: "8px 12px", borderRadius: 999, background: `${COLORS.wood}cc`, border: `1px solid ${COLORS.amber}33` }}>
              Learn hard songs one fret at a time
            </div>
            <button
              onClick={handleSignOut}
              style={{
                padding: "8px 16px", borderRadius: 999, border: `1px solid ${COLORS.woodLight}`,
                background: "transparent", color: COLORS.creamDim, fontFamily: "Inter, sans-serif",
                fontSize: 13, cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "stretch", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 92 }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: active ? "16px 10px" : "12px 10px",
                    borderRadius: 14,
                    border: `1px solid ${active ? COLORS.amber : COLORS.woodLight}`,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    background: active ? COLORS.amber : COLORS.wood,
                    color: active ? COLORS.bg : COLORS.creamDim,
                    transition: "all 0.2s ease",
                    transform: active ? "scale(1.04) rotate(180deg)" : "scale(1) rotate(180deg)",
                    boxShadow: active ? "0 8px 24px rgba(0,0,0,0.25)" : "none",
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    letterSpacing: "0.08em",
                    minHeight: active ? 96 : 84,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, marginBottom: 30 }}>
            {tab === "search" && <SearchTab progress={progress} onPreviewSong={handlePreviewSong} />}
            {tab === "path" && <LearningPathTab progress={progress} onOpenPractice={setPracticeSong} onPreviewSong={handlePreviewSong} />}
            {tab === "backing" && <BackingTracksTab />}
          </div>
        </div>
      </div>

      {practiceSong && (
        <PracticeModal
          song={practiceSong}
          onClose={() => setPracticeSong(null)}
          onPass={(song, score) => {
            handlePass(song, score);
            setPracticeSong(null);
          }}
        />
      )}

      {celebrate && (
        <div
          style={{
            position: "fixed", bottom: 24, right: 24, background: COLORS.teal, color: COLORS.bg,
            padding: "16px 22px", borderRadius: 14, fontFamily: "Inter, sans-serif", fontWeight: 700,
            boxShadow: "0 8px 30px #0006", zIndex: 200,
          }}
        >
          🎉 {celebrate.song.title} complete — {celebrate.score}% · +XP
        </div>
      )}
    </div>
  );
}