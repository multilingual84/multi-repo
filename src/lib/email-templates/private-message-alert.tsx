import React from 'react';
import {Html,Head,Body,Container,Heading,Text,Button,Preview} from '@react-email/components';
import type {TemplateEntry} from './registry';
import {messageCopy} from '@/lib/private-message-copy';
function Alert({locale='en'}:{locale?:string}){const c=messageCopy(locale);return <Html lang={locale}><Head/><Preview>{c.alert}</Preview><Body style={{backgroundColor:'#ffffff',fontFamily:'Arial,sans-serif'}}><Container style={{padding:'24px'}}><Heading>Multi-Lingual™</Heading><Text>{c.alertBody}</Text><Button href="https://multi-lingual.tech/?messages=1" style={{padding:'12px 20px',backgroundColor:'#202020',color:'#ffffff'}}>{c.inbox}</Button></Container></Body></Html>;}
export const template={component:Alert,subject:(d:Record<string,unknown>)=>messageCopy(typeof d['locale']==='string'?d['locale']:'en').alert,displayName:'Private message alert',previewData:{locale:'en'}} satisfies TemplateEntry;
