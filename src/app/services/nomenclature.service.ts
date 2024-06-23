import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoggerService } from './logger.service';

export interface Nomenclature {
  person: string;
  organization: string;
}

@Injectable({
  providedIn: 'root'
})
export class NomenclatureService {

  private nomenclature: { [key: string]: Nomenclature } = {
    contacts: {
      person: 'Contact',
      organization: 'Company'
    },
    lms: {
      person: 'Student',
      organization: 'Campus'
    },
    lis: {
      person: 'Patient',
      organization: 'Lab'
    }
  };

  constructor(private logger: LoggerService) {}

  private currentSystemSubject: BehaviorSubject<string> = new BehaviorSubject<string>('contacts');
  currentSystem$: Observable<string> = this.currentSystemSubject.asObservable();

  private currentNomenclatureSubject: BehaviorSubject<Nomenclature> = new BehaviorSubject<Nomenclature>(this.nomenclature['contacts']);
  currentNomenclature$: Observable<Nomenclature> = this.currentNomenclatureSubject.asObservable();

  setSystem(system: string) {
    this.currentSystemSubject.next(system);
    this.currentNomenclatureSubject.next(this.nomenclature[system]);
  }

  getNomenclature(category: keyof Nomenclature): string {
    const currentSystem = this.currentSystemSubject.value;
    this.logger.info("Returning", category, this.nomenclature[currentSystem][category]);
    return this.nomenclature[currentSystem][category];
  }

  updateNomenclature(system: string, newNomenclature: Partial<Nomenclature>) {
    this.logger.info("updateNomenclature", system);
    this.nomenclature[system] = { ...this.nomenclature[system], ...newNomenclature };
    if (this.currentSystemSubject.value === system) {
      this.currentNomenclatureSubject.next(this.nomenclature[system]);
    }
  }
}
