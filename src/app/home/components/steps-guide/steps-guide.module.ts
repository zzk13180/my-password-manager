import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { OverlayContainerRef } from './overlay-container'
import { PositioningModule } from './positioning/positioning.module'
import { SafePipeModule } from './safe-pipe.module'
import { StepsGuideComponent } from './steps-guide.component'
import { StepsGuideDirective } from './steps-guide.directive'
import { StepsGuideService } from './steps-guide.service'

@NgModule({
  imports: [CommonModule, SafePipeModule, PositioningModule],
  declarations: [StepsGuideComponent, StepsGuideDirective],
  exports: [StepsGuideDirective],
  providers: [OverlayContainerRef, StepsGuideService],
})
export class StepsGuideModule {}
