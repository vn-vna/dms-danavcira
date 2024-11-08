export type FilterInfo = { [key: string]: any };

export default function parseFilterString(filterString: string) {
  const filterParts = filterString.split(",");
  const filterInfo: FilterInfo = {};

  for (const part of filterParts) {
    if (!part.includes(":")) {
      continue;
    }

    const [key, value] = part.split(":");

    let is_number = true;
    for (const char of value) {
      if (isNaN(parseInt(char))) {
        is_number = false;
        break;
      }
    }

    if (is_number) {

      filterInfo[key] = parseInt(value)
    } else {
      filterInfo[key] = value
    }
  }

  return filterInfo;
}