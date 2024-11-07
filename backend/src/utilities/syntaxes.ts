export type FilterInfo = { [key: string]: any };

export default function parseFilterString(filterString: string) {
  const filterParts = filterString.split(",");
  const filterInfo: FilterInfo = {};

  for (const part of filterParts) {
    const [key, value] = part.split(":");

    try {
      filterInfo[key] = parseInt(value)
    }
    catch {
      filterInfo[key] = value
    }
  }

  return filterInfo;
}