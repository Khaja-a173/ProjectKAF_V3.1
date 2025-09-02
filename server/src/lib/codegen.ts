import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const nano = customAlphabet(alphabet, 4);

export function generateRestaurantCode() { 
  return nano(); 
}