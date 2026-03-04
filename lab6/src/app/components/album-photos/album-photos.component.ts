import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-album-photos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './album-photos.component.html',
  styleUrls: ['./album-photos.component.css'],
})
export class AlbumPhotosComponent implements OnInit {
  allPhotos: Photo[] = [];
  visiblePhotos: Photo[] = [];
  albumId: number = 0;
  loading = true;
  error: string | null = null;

  pageSize = 12;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private albumService: AlbumService
  ) {}

  ngOnInit(): void {
    this.albumId = Number(this.route.snapshot.paramMap.get('id'));
    this.albumService.getAlbumPhotos(this.albumId).subscribe({
      next: (data) => {
        this.allPhotos = data;
        this.totalPages = Math.ceil(data.length / this.pageSize);
        this.updatePage();
        this.loading = false;
      },
      error: (err) => {
        console.error('Photos load error:', err);
        this.error = 'Failed to load photos. Check your internet connection.';
        this.loading = false;
      },
    });
  }

  updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.visiblePhotos = this.allPhotos.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    const range = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  goBack(): void {
    this.router.navigate(['/albums', this.albumId]);
  }
}