export const fmtNumber = (n: number | null | undefined) =>
	n == null ? "—" : Number(n).toFixed(1);

export const labelCat = (k: string) => k.replaceAll("_", " ").toLowerCase();
