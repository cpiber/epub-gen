import { AEpub } from './AEpub';
import { Options, Content } from './util';

export class EpubStream extends AEpub {
  constructor(options: Options, content: Content) {
    super(options, content);
    throw new Error('EpubStream is not supported in browser environments');
  }

  protected generateTemplateFiles(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  
  protected downloadAllFonts(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  
  protected downloadAllImages(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  
  protected makeCover(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  
  protected generateFinal(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  
  protected cleanup(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}