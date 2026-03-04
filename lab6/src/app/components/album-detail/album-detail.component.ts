import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { Album } from '../../models/album.model';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.css'],
})
export class AlbumDetailComponent implements OnInit {
  album: Album | null = null;
  loading = true;
  saving = false;
  saved = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private albumService: AlbumService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('Album ID from route:', idParam);

    if (!idParam) {
      this.error = 'No album ID found in URL.';
      this.loading = false;
      return;
    }

    const id = Number(idParam);

    if (isNaN(id)) {
      this.error = 'Invalid album ID.';
      this.loading = false;
      return;
    }

    this.albumService.getAlbum(id).subscribe({
      next: (data) => {
        console.log('Album loaded:', data);
        this.album = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Album load error:', err);
        this.error = 'Failed to load album. Check your internet connection.';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (!this.album) return;
    this.saving = true;
    this.albumService.updateAlbum(this.album).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
        setTimeout(() => (this.saved = false), 2500);
      },
      error: (err) => {
        console.error('Save error:', err);
        this.saving = false;
        alert('Failed to save changes.');
      },
    });
  }

viewPhotos(): void {
  this.router.navigate(['/albums', this.album?.id, 'photos']);
}

  goBack(): void {
    this.router.navigate(['/albums']);
  }
}