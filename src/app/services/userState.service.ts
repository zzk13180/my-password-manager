import { Injectable } from '@angular/core'
import { StorageKey } from '../enums/storageKey'
import { ElectronService } from './electron.service'
import { CryptoFunctionService } from './cryptoFunction.service'

export interface UserState {
  isRequiredLogin: boolean
  password: string
  salt: string
}

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private userState: UserState
  private userPassword: string
  constructor(
    private cryptoFunctionService: CryptoFunctionService,
    private electronService: ElectronService,
  ) {
    this.userState = {
      isRequiredLogin: false,
      password: '',
      salt: '',
    }
  }

  async getUserState(): Promise<UserState> {
    const str: string = await this.electronService.storageGet(StorageKey.userState)
    try {
      this.userState = JSON.parse(str)
    } catch (_) {
      const { password, salt } = await this.generatePassworAndSalt()
      this.userState = {
        isRequiredLogin: false,
        password,
        salt,
      }
      await this.setUserState(this.userState)
    }
    return this.userState
  }

  async setUserState(userState: UserState): Promise<void> {
    await this.electronService.storageSave(
      StorageKey.userState,
      JSON.stringify(userState),
    )
    this.userState = userState
  }

  getUserPassword(): string {
    return this.userPassword
  }

  async setUserPassword(userPassword: string): Promise<void> {
    await this.setUserState({ ...this.userState, isRequiredLogin: true })
    this.userPassword = userPassword
  }

  private async generatePassworAndSalt(): Promise<Omit<UserState, 'isRequiredLogin'>> {
    const bytes = await this.cryptoFunctionService.randomBytes(35)
    let password = ''
    let salt = ''
    const arr = new Uint8Array(bytes)
    for (let i = 0; i < arr.byteLength; i++) {
      if (i < 14) {
        password += `${arr[i]}${i === 13 ? '' : ','}`
      } else {
        salt += `${arr[i]}${i === 34 ? '' : ','}`
      }
    }
    return { password, salt }
  }
}