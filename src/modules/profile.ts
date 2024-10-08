import { Module, ModuleTitle } from "./_module";
import { UpdateElementValues } from "./settings";

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
                active: () => false,
                options: Object.keys(GARBLE_PHRASES),
                value: "Human",
                label: "Use a preset profile or make your own",
                loop: true,
                onSet(C)
                {
                    PlayerP(C).garblePhrases = GARBLE_PHRASES[PlayerP(C).type];
                    UpdateElementValues();
                }
            } as OptionSetting, {
                name: "garblePhrases",
                type: "text",
                active: (C) => PlayerP(C).type === "Custom",
                value: GARBLE_PHRASES.Human,
                label: "Phrases you speak when unable to be understood",
                maxChars: 1024,
                width: 400
            } as TextSetting, {
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
                    GetRecord(ModuleTitle.VirtualPet, C).noHands = true;
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
        // For later me
    }
}
