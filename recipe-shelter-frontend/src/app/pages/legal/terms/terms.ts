import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleComponent } from '../../../shared/article/article';

@Component({
  selector: 'rs-terms',
  imports: [RouterLink, ArticleComponent],
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
export class Terms { }
