/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
set a password dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import {
  Component,
  Inject,
  NgZone,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
} from '@angular/core'
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'
import { StorageKey } from 'src/app/enums'
import { UserStateService, DbService, ElectronService } from '../../../services'
import type { NgModel } from '@angular/forms'
import type { CardState } from '../../../models'

@Component({
  templateUrl: './password-set-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordSetDialog implements AfterViewInit {
  see = true
  _password = ''
  @ViewChild('passwordModel') passwordModel: NgModel
  // eslint-disable-next-line max-params
  constructor(
    public dialogRef: LyDialogRef,
    private userStateService: UserStateService,
    private dbService: DbService,
    private ngZone: NgZone,
    private _cd: ChangeDetectorRef,
    private electronService: ElectronService,
    @Inject(LY_DIALOG_DATA)
    public data: {
      isLogin: boolean
    },
  ) {}

  ngAfterViewInit(): void {
    const encoder = new TextEncoder()
    this.passwordModel.valueChanges.subscribe((password: string) => {
      const { byteLength } = encoder.encode(password)
      if (byteLength > 64) {
        this.passwordModel.control.setErrors({ maxbyte: true })
      }
    })
  }

  reset() {
    const { dialog } = window.electronAPI
    dialog.showMessageBox(
      {
        type: 'question',
        message: 'Reset Data',
        detail:
          'Warning: Resetting will result in the loss of all data! Are you sure to proceed?',
        buttons: ['Cancel', 'Yes'],
        defaultId: 0,
        cancelId: 0,
        noLink: true,
      },
      result => {
        if (result.response === 1) {
          this.ngZone.run(async () => {
            await this.electronService.storageClear()
            this.dialogRef.close(true)
            this._cd.detectChanges()
          })
        }
      },
    )
  }

  async ok() {
    if (!this.passwordModel.valid) {
      return
    }
    if (!this.data.isLogin) {
      await this.changePassword()
      this.dialogRef.close()
    } else {
      const loginOk = await this.login()
      if (!loginOk) {
        this.ngZone.run(() => {
          this.passwordModel.control.setErrors({ passwordFail: true })
          this._cd.detectChanges()
        })
      } else {
        this.dialogRef.close(true)
      }
    }
  }

  private async changePassword() {
    let theCards: CardState
    try {
      theCards = await this.dbService.getItem(StorageKey.cards)
    } catch (_) {}
    await this.userStateService.setUserPassword(this._password)
    try {
      theCards && (await this.dbService.setItem(StorageKey.cards, theCards))
    } catch (_) {}
  }

  private async login(): Promise<boolean> {
    await this.userStateService.setUserPassword(this._password)
    try {
      await this.dbService.getItem(StorageKey.cards)
    } catch (_) {
      return false
    }
    return true
  }
}