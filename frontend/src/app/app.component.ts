import { Component, OnInit } from '@angular/core';
import Pusher from 'pusher-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface MessageData {
  username: string;
  message: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  username: string = 'username';
  messages$: Observable<MessageData[]> = new Observable<MessageData[]>(); // Initialize with an empty observable
  message: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    Pusher.logToConsole = true;

    const pusher = new Pusher('9a5470d17ebacab25ff0', {
      cluster: 'ap2'
    });

    const channel = pusher.subscribe('chat');
    channel.bind('message', (data: MessageData) => { 
      window.location.reload();
    });
    this.messages$ = this.http.get<MessageData[]>('http://localhost:8000/messages');
  }

  submit(): void {
    const messageData = {
      username: this.username,
      message: this.message
    };

    this.http.post('http://localhost:8000/msg', messageData)
      .subscribe(
        () => {
          this.message = '';
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
  }
}
