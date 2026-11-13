import {createFileRoute} from '@tanstack/react-router';
import BroadcastListenerPage from '@/components/BroadcastListenerPage';

export const Route=createFileRoute('/listen/$broadcastId')({
 staticData:{sitemap:false},
 head:()=>({meta:[
  {title:'Listen to a Public Broadcast — Multi-Lingual™'},
  {name:'description',content:'Join a one-way Multi-Lingual public audio broadcast. Choose your listening language; no microphone or camera needed.'},
  {property:'og:title',content:'Listen to a Public Broadcast — Multi-Lingual™'},
  {property:'og:description',content:'Listen to the speaker on your own device, without enabling a microphone or camera.'},
  {property:'og:type',content:'website'},
  {name:'twitter:card',content:'summary'},
  {name:'robots',content:'noindex, nofollow'},
 ]}),
 component:ListenerRoute,
});
function ListenerRoute(){const {broadcastId}=Route.useParams();return <BroadcastListenerPage broadcastId={broadcastId}/>;}