import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { switchMap, tap } from "rxjs/operators";

import { PaisSmall } from '../../interfaces/paises.interface';

import { PaisesService } from '../../services/paises.service';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  public miFormulario: FormGroup = this._formBuilder.group({
    continente: ['', Validators.required],
    pais      : ['', Validators.required],
    frontera  : ['', Validators.required]
    // Sólo a modo ilustrativo de cómo se podría hacer un disabled desde aquí sin tocar el .html
    // frontera  : [{ value: '', disabled: true }, Validators.required]
  });

  // Variables para llenar los selectores
  public continentes!: string[];
  public paises     !: PaisSmall[] | null;
  public fronteras  !: PaisSmall[] | null;

  constructor(
    private _formBuilder: FormBuilder,
    private _paisesService: PaisesService  
  ) { }

  ngOnInit(): void {
    this.continentes = this._paisesService.continentes;

    // Esto es lo mismo que meterle un evento change al select de continentes
    // Con el valueChanges estamos pendientes de los cambios en el campo que le indicamos (en este caso el de continentes)
    // 
    // Vamos a usar el operador switchMap para cuando hacemos subscribes a observables dentro de otro subscribe de otro sobservable
    // 
    // Así sería de manera tradicional

    // this.miFormulario.get('continente')?.valueChanges.subscribe( continente => {
      
    //   if ( continente ) {
    //     this._paisesService.getPaisesPorContinente( continente ).subscribe( paises => { this.paises = paises; });
    //   }
      
    // });

    // Así con el switchMap
    // El tap es otro operador para poder hacer cosas de manera secundaria (en este caso resetear el valor del pais del formulario)
    this.miFormulario.get('continente')?.valueChanges
    .pipe(
      tap( (_) => {   // Es un stándar usar (_) cuando no me interesa la respuesta del observable (en este caso el contiente, porque no lo necesito)
        this.miFormulario.get('pais')?.reset('');
      }),
      switchMap( continente => this._paisesService.getPaisesPorContinente( continente ))
    )
    .subscribe( paises => { this.paises = paises; });

    // Hacemos lo mismo de arriba pero para sacar las fronteras del país seleccionado
    this.miFormulario.get('pais')?.valueChanges
    .pipe(
      tap( (_) => {
        this.miFormulario.get('frontera')?.reset('');
      }),
      switchMap( paisCode => this._paisesService.getPaisPorCodigo( paisCode ) ),
      switchMap( pais => this._paisesService.getPaisesPorCodigo( pais?.borders ) )
    )
    .subscribe ( paises => this.fronteras = paises )

  }

  guardar()
  {
    console.log(this.miFormulario.value);
    
  }

}
