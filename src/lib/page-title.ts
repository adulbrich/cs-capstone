import { brand } from "./brand";

export function pageTitle(page: string) {
  return `${page} | ${brand.institutionName} ${brand.programName}`;
}
