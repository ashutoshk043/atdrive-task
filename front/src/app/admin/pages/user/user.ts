import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { UserService } from '../../services/user';

interface UserData {
  id: number;
  username: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User implements OnInit {
  users: UserData[] = [];
  total = 0;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  console.log('USER INIT');
  this.getUsers();
}

ngOnDestroy(): void {
  console.log('USER DESTROY');
}

  getUsers(): void {
    this.userService.getUsers(1, 100).subscribe({
      next: (res: any) => {
        this.users = [...(res.data || [])];
        this.total = res.total || 0;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}