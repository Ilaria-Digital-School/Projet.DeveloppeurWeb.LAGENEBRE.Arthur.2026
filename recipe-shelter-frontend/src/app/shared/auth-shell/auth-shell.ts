import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'rs-auth-shell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.css',
})
export class AuthShell {
  @Input({ required: true }) panelTitle = '';
  @Input() panelText = '';
  @Input({ required: true }) panelCtaLabel = '';
  @Input({ required: true }) panelCtaLink = '/';

  @Input() panelImageUrl = '';
  @Input() overlayStrength = 0.32;
  @Input() panelMinHeight = '520px';
  @Input() panelAriaLabel = 'Panneau';

  get panelBackgroundStyle(): Record<string, string> {
    const strength = Math.min(1, Math.max(0, this.overlayStrength));
    const top = strength.toFixed(2);
    const bottom = Math.max(0, strength - 0.14).toFixed(2);

    const image = this.panelImageUrl?.trim()
      ? `, url("${this.panelImageUrl}")`
      : '';

    return {
      '--rs-auth-panel-min-h': this.panelMinHeight,
      'background-image': `linear-gradient(rgba(0,0,0,${top}), rgba(0,0,0,${bottom}))${image}`,
    };
  }
}