import {it,expect,vi} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import ClaraMessageReply from '@/components/ClaraMessageReply';
const speak=vi.hoisted(()=>vi.fn(()=>new Promise<void>(()=>{})));
vi.mock('@/lib/clara-voice',()=>({isVoiceSupported:()=>true,claraSpeak:speak}));
it('keeps the full text visible while Clara reads the same reply aloud',()=>{
 render(<ClaraMessageReply text="Hola, bienvenida." locale="es"/>);
 fireEvent.click(screen.getByRole('button',{name:'Escuchar a Clara'}));
 expect(speak).toHaveBeenCalledWith('Hola, bienvenida.','es');
 expect(screen.getByText('Hola, bienvenida.')).toBeTruthy();
 expect(screen.getByRole('button',{name:'Detener'})).toBeTruthy();
});