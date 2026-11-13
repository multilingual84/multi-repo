import {createFileRoute} from '@tanstack/react-router';
export const Route=createFileRoute('/api/premium-voice')({staticData:{sitemap:false},server:{handlers:{POST:async()=>Response.json({error:'Enhanced voice is no longer offered.'},{status:410})}}});
