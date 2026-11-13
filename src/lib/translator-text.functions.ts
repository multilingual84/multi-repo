import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
export const translateTypedTextFn=createServerFn({method:'POST'}).inputValidator((input:unknown)=>z.object({text:z.string().trim().min(1).max(4000),target:z.string().regex(/^[a-zA-Z-]{2,12}$/),consent:z.literal(true)}).parse(input)).handler(async({data})=>{const {translateOpenedText}=await import('@/lib/ai/message-translation.server');return translateOpenedText(data.text,data.target);});
