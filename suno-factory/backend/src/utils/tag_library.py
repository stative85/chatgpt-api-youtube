from enum import Enum


class SongSectionTags(str, Enum):
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


class VoiceTags(str, Enum):
    FEMALE = "Female Vocals"
    MALE = "Male Vocals"
    DUET = "Duet"
    CHOIR = "Choir"
    WHISPER = "Whisper"
    SCREAM = "Scream"
    RAP = "Rap"
    SPOKEN_WORD = "Spoken Word"


COMMON_STYLES = [
    "Synthwave",
    "Indie Pop",
    "Cinematic",
    "Lo-fi",
    "Ambient",
    "Trap",
    "Acoustic",
    "Orchestral",
    "House",
    "R&B",
]
