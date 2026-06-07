import { Component } from '@angular/core';
import { ArticleComponent } from '../../shared/article/article';

@Component({
  selector: 'rs-about',
  imports: [ArticleComponent],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About { }
