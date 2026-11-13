import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
import {voiceFundingSchema} from './funding-policy';
export const fundingStateFn=createServerFn({method:'POST'}).handler(async()=>{const {fundingState}=await import('./funding.server');return fundingState();});
export const fundingSetupFn=createServerFn({method:'POST'}).handler(async()=>{const {fundingSetup}=await import('./funding.server');return fundingSetup();});
export const fundingConfirmFn=createServerFn({method:'POST'}).inputValidator((input:unknown)=>z.object({id:z.string().regex(/^cs_(test|live)_[A-Za-z0-9]+$/)}).parse(input)).handler(async({data})=>{const {fundingConfirm}=await import('./funding.server');return fundingConfirm(data.id);});
export const fundingSaveFn=createServerFn({method:'POST'}).inputValidator((input:unknown)=>voiceFundingSchema.parse(input)).handler(async({data})=>{const {saveFunding}=await import('./funding.server');return saveFunding(data);});