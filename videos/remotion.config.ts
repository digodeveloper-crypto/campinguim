import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
// Sem isto a cena 3D pode sair vazia no render (TECNICA-3D.md, seção 3)
Config.setChromiumOpenGlRenderer('angle');
