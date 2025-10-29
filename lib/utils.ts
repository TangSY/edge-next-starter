import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名
 * 使用 clsx 处理条件类名，使用 tailwind-merge 合并冲突类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
