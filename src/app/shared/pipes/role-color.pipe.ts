import { Pipe, PipeTransform } from '@angular/core';
import { PlayerRole } from '../../core/models/game.model';

@Pipe({ name: 'roleColor', standalone: true })
export class RoleColorPipe implements PipeTransform {
  transform(role: PlayerRole | null | undefined): string {
    return role === 'Mafia' ? 'red' : role === 'Don' ? 'gold' : role === 'Doctor' ? 'green' : role === 'Sheriff' ? 'blue' : '';
  }
}
