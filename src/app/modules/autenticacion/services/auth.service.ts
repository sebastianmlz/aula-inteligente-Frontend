import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    // 👇 NUEVO: BehaviorSubject para el usuario actual
    private currentUserSubject = new BehaviorSubject<any>(this.getUser());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    /**
     * Realiza la autenticación del usuario
     * @param credentials Credenciales del usuario (email y password)
     * @returns Observable con la respuesta del servidor que incluye tokens de acceso y refresh
     */
    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}auth/login/`, {
            email: credentials.email,
            password: credentials.password
        }, {
            headers: { 'Content-Type': 'application/json' }
        }).pipe(
            tap(response => {
                localStorage.setItem('auth_access', response.access);
                localStorage.setItem('auth_refresh', response.refresh);
                localStorage.setItem('auth_user', JSON.stringify(response.user));
                // Guarda el primer rol si existe, o un string vacío
                localStorage.setItem('auth_role', response.roles?.[0] || '');
                // 👇 Actualiza el observable del usuario
                this.currentUserSubject.next(response.user);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('auth_access');
        localStorage.removeItem('auth_refresh');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_role');
        this.currentUserSubject.next(null); // Limpia el observable
        this.router.navigate(['/login']);
    }

    getUser(): any {
        const user = localStorage.getItem('auth_user');
        return user ? JSON.parse(user) : null;
    }

    actualizarUsuario(): void {
        const user = this.getUser();
        this.currentUserSubject.next(user);
    }

    getRole(): string {
        return localStorage.getItem('auth_role') || '';
    }

    isAdmin(): boolean {
        return this.getRole() === 'Administrator';
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('auth_access');
    }

    /**
     * Cambia la contraseña del usuario autenticado
     * @param id ID del usuario
     * @param data { current_password, new_password }
     */
    changePassword(id: number, data: { old_password: string, new_password: string , confirm_password:string }): Observable<any> {
        const token = localStorage.getItem('auth_access');
        if (!token) {
            throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
        }
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(
            `${this.apiUrl}auth/users/${id}/change_password/`,
            data,
            { headers }
        );
    }

    registrarUsuario(data: any): Observable<any> {
        const token = localStorage.getItem('auth_access');
        if (!token) {
            throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
        }
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(
            `${this.apiUrl}auth/users/`,
            data,
            { headers }
        );
    }

    getCurrentUserId(): string {
        const userData = this.getUser();
        return userData ? userData.id.toString() : '';
    }

    isTeacher(): boolean {
        const userData = this.getUser();
        return userData && userData.groups && userData.groups.includes(2);
    }
}