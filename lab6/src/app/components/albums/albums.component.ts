import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { Album } from '../../models/album.model';

@Component({
  selector: 'app-albums',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css'],
})
export class AlbumsComponent implements OnInit {
  allAlbums: Album[] = [];
  visibleAlbums: Album[] = [];
  loading = true;
  error: string | null = null;

  pageSize = 10;
  currentPage = 1;
  totalPages = 1;

  constructor(private albumService: AlbumService, private router: Router) {}

  ngOnInit(): void {
    this.albumService.getAlbums().subscribe({
      next: (data) => {
        this.allAlbums = data;
        this.totalPages = Math.ceil(data.length / this.pageSize);
        this.updatePage();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load albums. Please try again.';
        this.loading = false;
      },
    });
  }

  updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.visibleAlbums = this.allAlbums.slice(start, start + this.pageSize);
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

  goToDetail(id: number): void {
    this.router.navigate(['/albums', id]);
  }

  deleteAlbum(event: Event, id: number): void {
    event.stopPropagation();
    this.albumService.deleteAlbum(id).subscribe({
      next: () => {
        this.allAlbums = this.allAlbums.filter(a => a.id !== id);
        this.totalPages = Math.ceil(this.allAlbums.length / this.pageSize);
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        this.updatePage();
      },
      error: () => alert('Failed to delete album.'),
    });
  }
}