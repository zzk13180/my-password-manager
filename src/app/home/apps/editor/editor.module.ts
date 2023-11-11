import { NgModule } from '@angular/core'
import { SharedModule } from 'src/app/shared/shared.module'
import { EditorRoutingModule } from './editor-routing.module'
import { EditorComponent } from './editor.component'

@NgModule({
  declarations: [EditorComponent],
  imports: [SharedModule, EditorRoutingModule],
})
export class EditorModule {}
