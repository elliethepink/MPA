import { HookFunction } from "../util/sdk";
import { Module, ModuleTitle } from "./_module";
// import { UpdateElementValues } from "./settings";

const PlayerP: (C?: Character) => MPARecord = (C: Character = Player) =>
{
    return C.MPA?.[ModuleTitle.Profile] ?? {};
};

export function IsHardcoreOn(C: Character): boolean
{
    return (C.MPA?.[ModuleTitle.Profile].hardcore as boolean | undefined) ?? false;
};

function GetRecord(title: ModuleTitle, C: Character = Player): MPARecord
{
    return C.MPA?.[title] ?? {};
}

// Make sure not in BCX banned words / phrases
export const GARBLE_PHRASES = Object.freeze({
    Human: "Hmmgm",
    Custom: "",
    Bunny: "Pon",
    Cat: "Mew",
    Cow: "Moo",
    Dog: "Arf",
    Fox: "Chirp",
    Mouse: "Sqeak",
    Pony: "Neigh",
    Wolf: "Grrr"
});

export const PET_HEARING = Object.freeze({
    All: ["owner", "pet", "master", "mistress", "miss", "sir", "paw", "sit", "come", "down", "up",
        "stay", "water", "food", "kibble", "eat", "treat", "drink", "toy", "play", "leash", "walk",
        "walkies", "bed", "sleep", "cutie", "adorable", "toy", "play", "kibble", "good", "bad",
        "lap", "speak", "hush", "quiet", "hush", "all fours", "all-fours"],
    Human: [],
    Custom: [],
    Bunny: ["bun", "bunny", "carrot", "hop", "jump", "hump", "ear", "ears"],
    Cat: ["cat", "kitty", "kitten", "catnip", "knead", "scratch", "yarn", "milk"],
    Cow: ["milk", "milking", "utter", "breast", "grass", "moo"],
    Dog: ["cage", "kennel", "pup", "puppy", "dog", "doggy", "bone", "fetch", "heel", "roll", "over", "bark"],
    Fox: ["trap", "bun", "bunny", "bone", "fox", "foxy"],
    Mouse: ["mouse", "ear", "ears", "trap", "wire", "wheel", "cheese", "nibble", "cat", "kitty", "kitten"],
    Pony: ["pony", "mare", "stallion", "bridle", "hoof", "hooves", "trot", "stall", "hay", "woah",
        "stomp", "calm", "easy", "slow", "cart", "bay", "run", "race"],
    Wolf: ["bone", "wolf", "dog", "pup", "puppy", "heel"]
});

export class ProfileModule extends Module
{
    get Title(): ModuleTitle
    {
        return ModuleTitle.Profile;
    }

    get Settings(): Setting[]
    {
        return [
            {
                name: "type",
                type: "option",
                active: () => true,
                options: Object.keys(GARBLE_PHRASES),
                value: "Human",
                label: "Use a preset profile or make your own",
                loop: true
                // onSet(C)
                // {
                //     PlayerP(C).garblePhrases = GARBLE_PHRASES[PlayerP(C).type];
                //     UpdateElementValues();
                // }
            } as OptionSetting, {
                name: "petHearing",
                type: "checkbox",
                active: () => true,
                value: false,
                label: "While deafened certain pet keywords can be picked up"
            } as CheckboxSetting, /* {
                name: "garblePhrases",
                type: "text",
                active: (C) => PlayerP(C).type === "Custom",
                value: GARBLE_PHRASES.Human,
                label: "Phrases you speak when unable to be understood",
                maxChars: 1024,
                width: 400
            } as TextSetting, */{
                name: "hardcore",
                type: "checkbox",
                active: () => true,
                value: false,
                label: "Enable hardcore mode; Will set certain settings and prevent changing them back",
                onSet(C)
                {
                    GetRecord(ModuleTitle.Clicker, C).enabled = true;
                    GetRecord(ModuleTitle.Clicker, C).bcxVoice = true;
                    GetRecord(ModuleTitle.VirtualPet, C).enabled = true;
                    GetRecord(ModuleTitle.VirtualPet, C).noHands = false;
                    GetRecord(ModuleTitle.VirtualPetConditions, C).enabled = true;
                    GetRecord(ModuleTitle.VirtualPetConditions, C).foodNOW = true;
                    GetRecord(ModuleTitle.VirtualPetConditions, C).tint = true;
                    GetRecord(ModuleTitle.VirtualPetConditions, C).passout = true;
                    GetRecord(ModuleTitle.VirtualPetConditions, C).affectionSkillBuffs = false;
                    GetRecord(ModuleTitle.VirtualPetConditions, C).affectionSkillDebuffs = true;
                    GetRecord(ModuleTitle.VirtualPetConditions, C).hearingLoss = true;
                    GetRecord(ModuleTitle.VirtualPetConditions, C).slowLeave = true;
                }
            } as CheckboxSetting
        ];
    }

    Load(): void
    {
        super.Load();

        HookFunction(this.Title, "SpeechTransformGagGarble", 5, ([text, intensity, ignoreOOC, ...args], next) =>
        {
            // MBS adds Character parameter to this, can use as an extra check for when to apply
            const C = (args as [C?: Character, ...args: unknown[]])[0];

            // Are we gagging or deafening?
            // Not deafening so skip
            if (
                C?.IsGagged()
                || !Player.IsDeaf()
                || PlayerP().petHearing === false
            )
            {
                return next([text, intensity, ignoreOOC, ...args]);
            }

            // Split the input text into different substrings exluding the words you want to keep
            // Step 1: Get the words you want to keep if any
            const phrasesToKeep = PET_HEARING.All.concat(PET_HEARING[PlayerP()?.type]);
            // Add the Player's name as a word they can hear
            phrasesToKeep.push((Player.Nickname || Player.Name).toLocaleLowerCase());
            // Add the Player's gender as in the example, "Good girl"
            phrasesToKeep.push(Player.GetPronouns() === "SheHer" ? "girl" : "boy");

            // Step 2: Find the matches if they exist in the orginal message
            // Check lower case cuz the phrase we looking for in lower case, does not matter for final result, only want position
            const message = text.toLocaleLowerCase();
            const foundPhrases: { start: number; len: number }[] = [];
            phrasesToKeep.forEach((phrase) =>
            {
                const regExp = new RegExp(`\\b${phrase}\\b`, "g");
                const regexMatches = [...message.matchAll(regExp)];
                regexMatches.forEach((match) =>
                {
                    foundPhrases.push({ start: match.index, len: phrase.length });
                });
            });

            // No matches found so can skip and early return
            if (foundPhrases.length === 0)
            {
                return next([text, intensity, ignoreOOC, ...args]);
            }

            // Sort so that it is constructed in the correct order when put back together; lower starting indexes first
            foundPhrases.sort((a, b) => a.start - b.start);
            // Remove any phrases that are found within OOC speech range;
            const oocRanges = SpeechGetOOCRanges(text);
            oocRanges.forEach((range) =>
            {
                for (let i = foundPhrases.length - 1; i >= 0; i--)
                {
                    const phrase = foundPhrases[i];
                    // Remove if the phrase starts or ends within the ooc range
                    if (
                        (range.start < phrase.start && phrase.start < range.start + range.length)
                        || (range.start < phrase.start + phrase.len && phrase.start + phrase.len < range.start + range.length)
                    )
                    {
                        foundPhrases.splice(i, 1);
                    }
                }
            });

            // May need to check that one phrase does not start before another ends, and if so merge into a single longer entry

            let lastIndex = 0;
            let finalText = "";
            foundPhrases.forEach((found) =>
            {
                // Before the phrase to omit
                finalText += next([text.substring(lastIndex, found.start), intensity, ignoreOOC, ...args]);

                // Phrase we want to omit
                lastIndex = found.start + found.len;
                finalText += text.substring(found.start, found.start + found.len);
            });
            // Last of the text to garble up
            finalText += next([text.substring(lastIndex), intensity, ignoreOOC, ...args]);

            return finalText;
        });
    }
}
