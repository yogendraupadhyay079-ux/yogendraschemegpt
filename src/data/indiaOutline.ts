export const INDIA_VIEWBOX = '0 0 500 600';

export const MAP_CENTER = { x: 250, y: 300 };

export type CategoryKey =
  | 'students'
  | 'farmers'
  | 'women'
  | 'workers'
  | 'entrepreneurs'
  | 'seniors';

export const CATEGORY_ANCHORS: Record<CategoryKey, { x: number; y: number }> = {
  students: { x: 120, y: 180 },
  farmers: { x: 380, y: 220 },
  women: { x: 180, y: 380 },
  workers: { x: 350, y: 400 },
  entrepreneurs: { x: 300, y: 120 },
  seniors: { x: 200, y: 480 },
};

export interface IndiaLocation {
  id: string;
  path: string;
}

export const indiaLocations: IndiaLocation[] = [
  { id: 'jammu-kashmir', path: 'M 180 80 L 220 70 L 250 90 L 260 120 L 230 140 L 200 130 L 185 110 Z' },
  { id: 'himachal', path: 'M 200 140 L 240 135 L 260 155 L 245 175 L 215 170 L 200 160 Z' },
  { id: 'punjab', path: 'M 175 160 L 205 155 L 215 180 L 195 195 L 175 185 Z' },
  { id: 'haryana', path: 'M 195 185 L 240 180 L 255 205 L 230 220 L 200 210 Z' },
  { id: 'delhi', path: 'M 225 205 L 245 200 L 250 215 L 235 225 L 220 220 Z' },
  { id: 'uttarakhand', path: 'M 245 160 L 285 155 L 300 185 L 275 200 L 255 185 Z' },
  { id: 'up', path: 'M 255 200 L 320 195 L 340 230 L 310 250 L 270 240 L 250 220 Z' },
  { id: 'rajasthan', path: 'M 150 200 L 220 195 L 240 230 L 220 270 L 180 280 L 145 250 L 135 220 Z' },
  { id: 'gujarat', path: 'M 120 270 L 175 265 L 190 300 L 165 330 L 130 320 L 110 295 Z' },
  { id: 'mp', path: 'M 220 250 L 290 245 L 310 290 L 280 320 L 230 315 L 210 280 Z' },
  { id: 'maharashtra', path: 'M 170 320 L 260 315 L 280 360 L 250 400 L 200 400 L 165 370 L 155 340 Z' },
  { id: 'goa', path: 'M 195 400 L 210 395 L 215 410 L 200 415 L 190 410 Z' },
  { id: 'karnataka', path: 'M 200 415 L 260 410 L 275 460 L 245 490 L 210 480 L 195 445 Z' },
  { id: 'kerala', path: 'M 215 490 L 245 485 L 250 530 L 225 545 L 210 525 Z' },
  { id: 'tamil-nadu', path: 'M 245 490 L 285 485 L 295 530 L 270 550 L 245 535 L 240 510 Z' },
  { id: 'andhra-pradesh', path: 'M 270 400 L 320 395 L 335 450 L 310 485 L 280 480 L 265 440 Z' },
  { id: 'telangana', path: 'M 280 350 L 325 345 L 340 385 L 315 400 L 285 390 L 275 365 Z' },
  { id: 'odisha', path: 'M 320 280 L 370 275 L 390 320 L 365 345 L 330 340 L 315 310 Z' },
  { id: 'chhattisgarh', path: 'M 290 290 L 335 285 L 350 325 L 325 345 L 295 335 L 285 310 Z' },
  { id: 'jharkhand', path: 'M 335 230 L 375 225 L 390 260 L 370 275 L 340 265 L 330 245 Z' },
  { id: 'bihar', path: 'M 320 200 L 385 195 L 400 225 L 380 240 L 340 235 L 325 220 Z' },
  { id: 'west-bengal', path: 'M 385 195 L 430 190 L 450 240 L 430 280 L 400 270 L 390 230 Z' },
  { id: 'sikkim', path: 'M 430 175 L 450 170 L 455 185 L 440 190 L 425 185 Z' },
  { id: 'assam', path: 'M 450 175 L 500 170 L 520 200 L 490 215 L 460 205 L 445 190 Z' },
  { id: 'arunachal', path: 'M 470 130 L 520 125 L 540 165 L 510 185 L 480 175 L 465 155 Z' },
  { id: 'nagaland', path: 'M 510 200 L 530 195 L 535 215 L 515 220 L 505 210 Z' },
  { id: 'manipur', path: 'M 515 225 L 535 220 L 540 240 L 520 245 L 510 235 Z' },
  { id: 'mizoram', path: 'M 490 250 L 520 245 L 525 270 L 500 275 L 485 265 Z' },
  { id: 'tripura', path: 'M 455 260 L 475 255 L 480 275 L 460 280 L 450 270 Z' },
  { id: 'meghalaya', path: 'M 475 210 L 500 205 L 505 225 L 485 230 L 470 220 Z' },
];
