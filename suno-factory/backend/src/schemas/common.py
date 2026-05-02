from enum import Enum


class SongSection(str, Enum):
    INTRO = "Intro"
    VERSE = "Verse"
    PRE_CHORUS = "Pre-Chorus"
    CHORUS = "Chorus"
    BRIDGE = "Bridge"
    OUTRO = "Outro"
    HOOK = "Hook"
    BREAK = "Break"
    INSTRUMENTAL = "Instrumental"
    DROP = "Drop"
