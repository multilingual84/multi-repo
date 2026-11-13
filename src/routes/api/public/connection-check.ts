import { createFileRoute } from '@tanstack/react-router';
export const Route=createFileRoute('/api/public/connection-check')({staticData:{sitemap:false},server:{handlers:{GET:async()=>Response.json({reachable:true},{headers:{'Cache-Control':'no-store'}})}}});
