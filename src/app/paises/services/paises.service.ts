import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { combineLatest, Observable, of } from 'rxjs';

import { PaisSmall } from '../interfaces/paises.interface';
import { Pais } from '../interfaces/paises.interface';


@Injectable({
  providedIn: 'root'
})
export class PaisesService {

  private _baseUrl: string = 'https://restcountries.eu/rest/v2';
  private _continentes: string[] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

  constructor(private _http: HttpClient) { }

  get continentes(): string[]
  {
    return [ ...this._continentes ];
  }

  getPaisesPorContinente( continente: string ): Observable<PaisSmall[] | null>
  {
    if ( !continente ) {
      return of(null);
    }

    const url: string = `${ this._baseUrl }/region/${ continente }?fields=alpha3Code;name`;

    return this._http.get<PaisSmall[]>( url );
  }

  getPaisPorCodigo( paisCode: string ): Observable<Pais | null>
  {
    if ( !paisCode ) {
      return of(null);
    }

    const url: string = `${ this._baseUrl }/alpha/${ paisCode }`;

    return this._http.get<Pais>( url );
  }

  // Como los paises fronterizos me vienen en un array de alpha3Code, vamos a hacernos estas 2 funciones para, a partir de ese código, obtener
  // el nombre y poder mostrarlos en el selector
  getPaisPorCodigoSmall( paisCode: string ): Observable<PaisSmall>
  {
    const url: string = `${ this._baseUrl }/alpha/${ paisCode }?fields=alpha3Code;name`;

    return this._http.get<PaisSmall>( url );
  }

  // Esta función va a recibir un array de alpha3Code de paises y va a llamar para cada uno de los elementos del array a la función de arriba,
  // por último devolverá un array observable de paisSmall (siempre que haya fronteras)
  getPaisesPorCodigo ( fronteras: string[] | undefined ): Observable <PaisSmall[] | null>
  {
    if ( !fronteras ) {
      return of(null);
    }

    const peticiones: Observable<PaisSmall>[] = [];

    fronteras.forEach( codigo => {
      const peticion = this.getPaisPorCodigoSmall( codigo );
      peticiones.push( peticion );
    })

    // No sé muy bien para qué sirve este operador pero es necesario usarlo para que funcione
    return combineLatest( peticiones );
  }
}
