/** 16-color palette, indexed `0x0`–`0xF`. */
const colors = [
    "black",    // 0x0
    "silver",   // 0x1
    "gray",     // 0x2
    "white",    // 0x3
    "maroon",   // 0x4
    "red",      // 0x5
    "purple",   // 0x6
    "fuchsia",  // 0x7
    "green",    // 0x8
    "lime",     // 0x9
    "olive",    // 0xA
    "yellow",   // 0xB
    "navy",     // 0xC
    "blue",     // 0xD
    "teal",     // 0xE
    "aqua"      // 0xF
] as const;

/** Sets canvas text styling using the {@link colors} palette and the `NES` font. */
export default class Text {
    private readonly ctx = window.game.ctx;

    /**
     * Sets `fillStyle` to a palette color.
     * @param idx palette index `0x0`–`0xF`
     */
    setColor(idx: number): void {
        this.ctx.fillStyle = colors[idx];
    }

    /** Sets the `NES` font at the given pixel size. */
    setFont(size: number): void {
        this.ctx.font = size + "px NES, sans-serif";
    }
}
